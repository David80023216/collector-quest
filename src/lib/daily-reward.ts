import prisma from './prisma'
import { addReward } from './economy'
import { addCommunityContribution } from './community'
import { checkAndAwardBadges } from './badges'
import { grantPack } from './packs'
import { LedgerTransactionType } from '@prisma/client'

/**
 * Get today's date as a YYYY-MM-DD string.
 */
function getTodayString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Check whether the user has already claimed their daily reward today.
 */
export async function canClaimDaily(userId: string): Promise<boolean> {
  const today = getTodayString()

  const existing = await prisma.dailyRewardClaim.findUnique({
    where: {
      userId_claimDate: { userId, claimDate: today },
    },
  })

  return !existing
}

/**
 * Claim the daily reward for a user.
 *
 * Steps:
 *  1. Check the user hasn't already claimed today
 *  2. Read admin settings for reward amounts
 *  3. Calculate streak (yesterday = increment, otherwise reset to 1)
 *  4. Check streak bonus (every streak_bonus_interval days)
 *  5. Create DailyRewardClaim record
 *  6. Update user entries, points, streak, lastStreakDate
 *  7. Add community contribution
 *  8. Award a pack if streak milestone (every 7 days)
 *  9. Check badges
 * 10. Return reward summary
 */
export async function claimDailyReward(userId: string): Promise<{
  success: boolean
  entries: number
  points: number
  streakDay: number
  packAwarded: boolean
  streakBonus: boolean
  bonusEntries?: number
  bonusPoints?: number
  error?: string
}> {
  const today = getTodayString()

  // 1. Check not already claimed
  const alreadyClaimed = await prisma.dailyRewardClaim.findUnique({
    where: {
      userId_claimDate: { userId, claimDate: today },
    },
  })

  if (alreadyClaimed) {
    return {
      success: false,
      entries: 0,
      points: 0,
      streakDay: 0,
      packAwarded: false,
      streakBonus: false,
      error: 'Already claimed today',
    }
  }

  // 2. Get admin settings for reward amounts
  const settingKeys = [
    'daily_reward_entries',
    'daily_reward_points',
    'streak_bonus_interval',
    'streak_bonus_entries',
    'streak_bonus_points',
    'streak_pack_interval',
    'streak_pack_definition_id',
  ]

  const settings = await prisma.adminSetting.findMany({
    where: { key: { in: settingKeys } },
  })

  const settingsMap: Record<string, string> = {}
  for (const s of settings) {
    settingsMap[s.key] = s.value
  }

  const baseEntries = parseInt(settingsMap['daily_reward_entries'] ?? '10', 10)
  const basePoints = parseInt(settingsMap['daily_reward_points'] ?? '5', 10)
  const streakBonusInterval = parseInt(settingsMap['streak_bonus_interval'] ?? '7', 10)
  const streakBonusEntries = parseInt(settingsMap['streak_bonus_entries'] ?? '50', 10)
  const streakBonusPoints = parseInt(settingsMap['streak_bonus_points'] ?? '25', 10)
  const streakPackInterval = parseInt(settingsMap['streak_pack_interval'] ?? '7', 10)
  const streakPackDefId = settingsMap['streak_pack_definition_id'] ?? null

  // 3. Calculate streak
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { currentStreak: true, longestStreak: true, lastStreakDate: true },
  })

  let newStreak = 1
  if (user.lastStreakDate) {
    const lastDate = new Date(user.lastStreakDate)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const lastDateStr = `${lastDate.getFullYear()}-${String(lastDate.getMonth() + 1).padStart(2, '0')}-${String(lastDate.getDate()).padStart(2, '0')}`
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`

    if (lastDateStr === yesterdayStr) {
      newStreak = user.currentStreak + 1
    }
    // If lastStreakDate is today (shouldn't happen since we checked), keep streak
    if (lastDateStr === today) {
      newStreak = user.currentStreak
    }
  }

  const newLongestStreak = Math.max(user.longestStreak, newStreak)

  // 4. Check streak bonus
  const isStreakBonus = newStreak > 0 && newStreak % streakBonusInterval === 0
  let totalEntries = baseEntries
  let totalPoints = basePoints
  let bonusEntries: number | undefined
  let bonusPoints: number | undefined

  if (isStreakBonus) {
    bonusEntries = streakBonusEntries
    bonusPoints = streakBonusPoints
    totalEntries += bonusEntries
    totalPoints += bonusPoints
  }

  // 5. Check if pack is awarded at streak milestone
  const packAwarded = newStreak > 0 && newStreak % streakPackInterval === 0 && !!streakPackDefId

  // Perform all writes in a transaction
  await prisma.$transaction(async (tx) => {
    // Create DailyRewardClaim
    await tx.dailyRewardClaim.create({
      data: {
        userId,
        claimDate: today,
        entriesAwarded: totalEntries,
        pointsAwarded: totalPoints,
        streakDay: newStreak,
        packAwarded,
      },
    })

    // Update user streak and lastStreakDate
    await tx.user.update({
      where: { id: userId },
      data: {
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastStreakDate: new Date(),
      },
    })
  })

  // 6. Award entries and points via economy (creates ledger entry)
  await addReward(
    userId,
    totalEntries,
    totalPoints,
    LedgerTransactionType.DAILY_REWARD,
    `Daily reward – Day ${newStreak}`,
    today
  )

  // If there was a streak bonus, add a separate ledger entry for tracking
  if (isStreakBonus && bonusEntries && bonusPoints) {
    // The bonus is already included in the reward above, but we log it separately
    // Actually, we already included it – this is just for community contribution
  }

  // 7. Add community contribution
  await addCommunityContribution(userId, 'daily_claim', 1)

  // 8. Award pack if streak milestone
  if (packAwarded && streakPackDefId) {
    try {
      await grantPack(userId, streakPackDefId, `streak_milestone_day_${newStreak}`)
    } catch {
      // Pack grant failed – log but don't fail the claim
      console.error(`Failed to grant streak pack to user ${userId}`)
    }
  }

  // 9. Check badges (fire and forget – non-blocking)
  checkAndAwardBadges(userId).catch((err) => {
    console.error('Badge check failed:', err)
  })

  return {
    success: true,
    entries: totalEntries,
    points: totalPoints,
    streakDay: newStreak,
    packAwarded,
    streakBonus: isStreakBonus,
    bonusEntries,
    bonusPoints,
  }
}

/**
 * Get claim history for a user, ordered by most recent first.
 */
export async function getClaimHistory(userId: string, limit = 30) {
  return prisma.dailyRewardClaim.findMany({
    where: { userId },
    orderBy: { claimedAt: 'desc' },
    take: limit,
  })
}

import prisma from './prisma'
import { addReward } from './economy'
import { addCommunityContribution } from './community'
import { checkAndAwardBadges } from './badges'
import { grantPack } from './packs'
import { LedgerTransactionType, Mission, MissionCompletion, UserPlan } from '@prisma/client'

type MissionWithStatus = Mission & {
  completed: boolean
  completionId?: string
}

/**
 * Get the current rotation day (1-180) and week (1-26).
 * Day is based on day-of-year mod 180, week on week-of-year mod 26.
 */
export function getCurrentRotation(): { day: number; week: number } {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - startOfYear.getTime()
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))

  const day = (dayOfYear % 180) + 1

  // ISO week calculation
  const tempDate = new Date(now.getTime())
  tempDate.setDate(tempDate.getDate() + 4 - (tempDate.getDay() || 7))
  const yearStart = new Date(tempDate.getFullYear(), 0, 1)
  const weekOfYear = Math.ceil(
    ((tempDate.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24) + 1) / 7
  )
  const week = ((weekOfYear - 1) % 26) + 1

  return { day, week }
}

/**
 * Get today's date as a YYYY-MM-DD string.
 */
function getTodayString(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

/**
 * Get today's available missions for a user.
 *
 * - Daily missions match the current rotationDay
 * - Weekly missions match the current rotationWeek
 * - Free users see 5 daily + 1 weekly; Pro users see all
 */
export async function getTodaysMissions(userId: string): Promise<MissionWithStatus[]> {
  const { day, week } = getCurrentRotation()
  const today = getTodayString()

  // Get user plan
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { plan: true },
  })

  // Fetch daily missions for today's rotation day
  const dailyMissions = await prisma.mission.findMany({
    where: {
      isActive: true,
      scope: 'DAILY',
      rotationDay: day,
    },
    orderBy: { createdAt: 'asc' },
  })

  // Fetch weekly missions for the current rotation week
  const weeklyMissions = await prisma.mission.findMany({
    where: {
      isActive: true,
      scope: 'WEEKLY',
      rotationWeek: week,
    },
    orderBy: { createdAt: 'asc' },
  })

  // Apply limits for free users
  let availableDaily = dailyMissions
  let availableWeekly = weeklyMissions

  if (user.plan === UserPlan.FREE) {
    availableDaily = dailyMissions.slice(0, 5)
    availableWeekly = weeklyMissions.slice(0, 1)
  }

  const allMissions = [...availableDaily, ...availableWeekly]
  const missionIds = allMissions.map((m) => m.id)

  // Build unique key prefixes for today's completions
  const uniqueKeyPrefixes = missionIds.map(
    (mId) => `${userId}_${mId}_${today}`
  )

  // Get completions for these missions today
  const completions = await prisma.missionCompletion.findMany({
    where: {
      uniqueKey: { in: uniqueKeyPrefixes },
    },
  })

  const completionMap = new Map<string, MissionCompletion>()
  for (const c of completions) {
    // Extract missionId from uniqueKey: userId_missionId_date
    const parts = c.uniqueKey.split('_')
    // The missionId is between the first _ and last _date
    // Since CUIDs don't contain underscores and the date part is fixed, we reconstruct
    const missionId = c.missionId
    completionMap.set(missionId, c)
  }

  return allMissions.map((mission) => {
    const completion = completionMap.get(mission.id)
    return {
      ...mission,
      completed: !!completion,
      completionId: completion?.id,
    }
  })
}

/**
 * Complete a mission for a user.
 *
 * Steps:
 *  1. Verify mission exists and is available today (rotation check)
 *  2. Check not already completed today (uniqueKey)
 *  3. Create MissionCompletion
 *  4. Award entries + points via economy
 *  5. If packReward, add pack to inventory
 *  6. Add community contribution
 *  7. Check badges
 */
export async function completeMission(
  userId: string,
  missionId: string
): Promise<{
  success: boolean
  entries: number
  points: number
  packAwarded: boolean
  error?: string
}> {
  const { day, week } = getCurrentRotation()
  const today = getTodayString()
  const uniqueKey = `${userId}_${missionId}_${today}`

  // 1. Verify mission exists and is available today
  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
  })

  if (!mission || !mission.isActive) {
    return {
      success: false,
      entries: 0,
      points: 0,
      packAwarded: false,
      error: 'Mission not found or inactive',
    }
  }

  // Check rotation availability
  if (mission.scope === 'DAILY' && mission.rotationDay !== day) {
    return {
      success: false,
      entries: 0,
      points: 0,
      packAwarded: false,
      error: 'Mission is not available today',
    }
  }

  if (mission.scope === 'WEEKLY' && mission.rotationWeek !== week) {
    return {
      success: false,
      entries: 0,
      points: 0,
      packAwarded: false,
      error: 'Mission is not available this week',
    }
  }

  // 2. Check not already completed
  const existing = await prisma.missionCompletion.findUnique({
    where: { uniqueKey },
  })

  if (existing) {
    return {
      success: false,
      entries: 0,
      points: 0,
      packAwarded: false,
      error: 'Mission already completed today',
    }
  }

  // 3. Create MissionCompletion
  await prisma.missionCompletion.create({
    data: {
      uniqueKey,
      userId,
      missionId,
    },
  })

  // 4. Award entries + points
  const entries = mission.entriesReward
  const points = mission.pointsReward

  if (entries > 0 || points > 0) {
    await addReward(
      userId,
      entries,
      points,
      LedgerTransactionType.MISSION_REWARD,
      `Mission: ${mission.title}`,
      missionId
    )
  }

  // 5. If packReward, grant a pack
  let packAwarded = false
  if (mission.packReward) {
    try {
      // Find a default active pack definition
      const defaultPack = await prisma.rewardPackDefinition.findFirst({
        where: { isActive: true, proOnly: false },
        orderBy: { createdAt: 'asc' },
      })

      if (defaultPack) {
        await grantPack(userId, defaultPack.id, `mission_${missionId}`)
        packAwarded = true
      }
    } catch {
      console.error('Failed to grant mission pack reward')
    }
  }

  // 6. Add community contribution
  if (mission.contributionValue > 0) {
    await addCommunityContribution(userId, 'mission_complete', mission.contributionValue)
  }

  // 7. Check badges (non-blocking)
  checkAndAwardBadges(userId).catch((err) => {
    console.error('Badge check failed:', err)
  })

  return {
    success: true,
    entries,
    points,
    packAwarded,
  }
}

/**
 * Get mission completion statistics for a user.
 */
export async function getMissionStats(userId: string) {
  const [totalCompletions, todayCompletions, streakData] = await Promise.all([
    prisma.missionCompletion.count({
      where: { userId },
    }),
    prisma.missionCompletion.count({
      where: {
        userId,
        completedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.missionCompletion.groupBy({
      by: ['missionId'],
      where: { userId },
      _count: { id: true },
    }),
  ])

  return {
    totalCompletions,
    todayCompletions,
    uniqueMissionsCompleted: streakData.length,
  }
}

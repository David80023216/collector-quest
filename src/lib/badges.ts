import prisma from './prisma'

/**
 * Check all badge criteria for a user and award any they qualify for.
 *
 * Each badge has a `requirement` (the stat to check) and `requiredValue` (the threshold).
 * The `category` groups badges by type (streak, missions, packs, community, trivia, store).
 */
export async function checkAndAwardBadges(userId: string) {
  // Get all active badge definitions
  const badges = await prisma.badge.findMany({
    where: { isActive: true },
  })

  if (badges.length === 0) return

  // Get badges the user already has
  const existingBadges = await prisma.userBadge.findMany({
    where: { userId },
    select: { badgeId: true },
  })
  const earnedBadgeIds = new Set(existingBadges.map((b) => b.badgeId))

  // Get user stats
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      currentStreak: true,
      longestStreak: true,
      totalContributions: true,
      points: true,
    },
  })

  // Gather stats by category as needed
  const statsCache: Record<string, number> = {}

  const getStatValue = async (requirement: string): Promise<number> => {
    if (statsCache[requirement] !== undefined) {
      return statsCache[requirement]
    }

    let value = 0

    switch (requirement) {
      case 'current_streak':
        value = user.currentStreak
        break

      case 'longest_streak':
        value = user.longestStreak
        break

      case 'missions_completed':
        value = await prisma.missionCompletion.count({ where: { userId } })
        break

      case 'packs_opened':
        value = await prisma.rewardPackOpen.count({ where: { userId } })
        break

      case 'community_contributions':
        value = user.totalContributions
        break

      case 'trivia_correct':
        value = await prisma.triviaResponse.count({
          where: { userId, isCorrect: true },
        })
        break

      case 'trivia_answered':
        value = await prisma.triviaResponse.count({ where: { userId } })
        break

      case 'polls_voted':
        value = await prisma.pollResponse.count({ where: { userId } })
        break

      case 'points_spent': {
        const spent = await prisma.storeRedemption.aggregate({
          where: { userId },
          _sum: { pointsSpent: true },
        })
        value = spent._sum.pointsSpent ?? 0
        break
      }

      case 'store_purchases':
        value = await prisma.storeRedemption.count({ where: { userId } })
        break

      case 'daily_claims': {
        value = await prisma.dailyRewardClaim.count({ where: { userId } })
        break
      }

      case 'badges_earned':
        value = earnedBadgeIds.size
        break

      default:
        value = 0
    }

    statsCache[requirement] = value
    return value
  }

  // Check each badge
  const badgesToAward: string[] = []

  for (const badge of badges) {
    // Skip if already earned
    if (earnedBadgeIds.has(badge.id)) continue

    const currentValue = await getStatValue(badge.requirement)

    if (currentValue >= badge.requiredValue) {
      badgesToAward.push(badge.id)
    }
  }

  // Award all qualifying badges
  if (badgesToAward.length > 0) {
    await prisma.userBadge.createMany({
      data: badgesToAward.map((badgeId) => ({
        userId,
        badgeId,
      })),
      skipDuplicates: true,
    })
  }
}

/**
 * Get all badges a user has earned, with badge details.
 */
export async function getUserBadges(userId: string) {
  return prisma.userBadge.findMany({
    where: { userId },
    include: {
      badge: true,
    },
    orderBy: { awardedAt: 'desc' },
  })
}

/**
 * Check streak-related badges for a user.
 */
async function checkStreakBadges(
  userId: string,
  currentStreak: number,
  longestStreak: number
) {
  const badges = await prisma.badge.findMany({
    where: {
      isActive: true,
      category: 'streak',
    },
  })

  const existing = await prisma.userBadge.findMany({
    where: { userId, badge: { category: 'streak' } },
    select: { badgeId: true },
  })
  const earnedIds = new Set(existing.map((b) => b.badgeId))

  const toAward: string[] = []

  for (const badge of badges) {
    if (earnedIds.has(badge.id)) continue

    const value =
      badge.requirement === 'current_streak' ? currentStreak : longestStreak

    if (value >= badge.requiredValue) {
      toAward.push(badge.id)
    }
  }

  if (toAward.length > 0) {
    await prisma.userBadge.createMany({
      data: toAward.map((badgeId) => ({ userId, badgeId })),
      skipDuplicates: true,
    })
  }
}

/**
 * Check mission-related badges for a user.
 */
async function checkMissionBadges(userId: string) {
  const badges = await prisma.badge.findMany({
    where: { isActive: true, category: 'missions' },
  })

  const existing = await prisma.userBadge.findMany({
    where: { userId, badge: { category: 'missions' } },
    select: { badgeId: true },
  })
  const earnedIds = new Set(existing.map((b) => b.badgeId))

  const completionCount = await prisma.missionCompletion.count({
    where: { userId },
  })

  const toAward: string[] = []

  for (const badge of badges) {
    if (earnedIds.has(badge.id)) continue
    if (completionCount >= badge.requiredValue) {
      toAward.push(badge.id)
    }
  }

  if (toAward.length > 0) {
    await prisma.userBadge.createMany({
      data: toAward.map((badgeId) => ({ userId, badgeId })),
      skipDuplicates: true,
    })
  }
}

/**
 * Check pack-related badges for a user.
 */
async function checkPackBadges(userId: string) {
  const badges = await prisma.badge.findMany({
    where: { isActive: true, category: 'packs' },
  })

  const existing = await prisma.userBadge.findMany({
    where: { userId, badge: { category: 'packs' } },
    select: { badgeId: true },
  })
  const earnedIds = new Set(existing.map((b) => b.badgeId))

  const packCount = await prisma.rewardPackOpen.count({
    where: { userId },
  })

  const toAward: string[] = []

  for (const badge of badges) {
    if (earnedIds.has(badge.id)) continue
    if (packCount >= badge.requiredValue) {
      toAward.push(badge.id)
    }
  }

  if (toAward.length > 0) {
    await prisma.userBadge.createMany({
      data: toAward.map((badgeId) => ({ userId, badgeId })),
      skipDuplicates: true,
    })
  }
}

/**
 * Check community-related badges for a user.
 */
async function checkCommunityBadges(userId: string) {
  const badges = await prisma.badge.findMany({
    where: { isActive: true, category: 'community' },
  })

  const existing = await prisma.userBadge.findMany({
    where: { userId, badge: { category: 'community' } },
    select: { badgeId: true },
  })
  const earnedIds = new Set(existing.map((b) => b.badgeId))

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { totalContributions: true },
  })

  const toAward: string[] = []

  for (const badge of badges) {
    if (earnedIds.has(badge.id)) continue
    if (user.totalContributions >= badge.requiredValue) {
      toAward.push(badge.id)
    }
  }

  if (toAward.length > 0) {
    await prisma.userBadge.createMany({
      data: toAward.map((badgeId) => ({ userId, badgeId })),
      skipDuplicates: true,
    })
  }
}

/**
 * Check trivia-related badges for a user.
 */
async function checkTriviaBadges(userId: string) {
  const badges = await prisma.badge.findMany({
    where: { isActive: true, category: 'trivia' },
  })

  const existing = await prisma.userBadge.findMany({
    where: { userId, badge: { category: 'trivia' } },
    select: { badgeId: true },
  })
  const earnedIds = new Set(existing.map((b) => b.badgeId))

  const [correctCount, totalCount] = await Promise.all([
    prisma.triviaResponse.count({ where: { userId, isCorrect: true } }),
    prisma.triviaResponse.count({ where: { userId } }),
  ])

  const toAward: string[] = []

  for (const badge of badges) {
    if (earnedIds.has(badge.id)) continue

    const value =
      badge.requirement === 'trivia_correct' ? correctCount : totalCount

    if (value >= badge.requiredValue) {
      toAward.push(badge.id)
    }
  }

  if (toAward.length > 0) {
    await prisma.userBadge.createMany({
      data: toAward.map((badgeId) => ({ userId, badgeId })),
      skipDuplicates: true,
    })
  }
}

/**
 * Check store-related badges for a user.
 */
async function checkStoreBadges(userId: string) {
  const badges = await prisma.badge.findMany({
    where: { isActive: true, category: 'store' },
  })

  const existing = await prisma.userBadge.findMany({
    where: { userId, badge: { category: 'store' } },
    select: { badgeId: true },
  })
  const earnedIds = new Set(existing.map((b) => b.badgeId))

  const [purchaseCount, spentAggregate] = await Promise.all([
    prisma.storeRedemption.count({ where: { userId } }),
    prisma.storeRedemption.aggregate({
      where: { userId },
      _sum: { pointsSpent: true },
    }),
  ])

  const pointsSpent = spentAggregate._sum.pointsSpent ?? 0

  const toAward: string[] = []

  for (const badge of badges) {
    if (earnedIds.has(badge.id)) continue

    const value =
      badge.requirement === 'points_spent' ? pointsSpent : purchaseCount

    if (value >= badge.requiredValue) {
      toAward.push(badge.id)
    }
  }

  if (toAward.length > 0) {
    await prisma.userBadge.createMany({
      data: toAward.map((badgeId) => ({ userId, badgeId })),
      skipDuplicates: true,
    })
  }
}

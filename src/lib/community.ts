import prisma from './prisma'

/**
 * Add a community contribution for a user action.
 * Updates the user's totalContributions and checks for milestone unlocks.
 */
export async function addCommunityContribution(
  userId: string,
  actionType: string,
  value = 1
) {
  // Create the contribution record
  await prisma.communityContribution.create({
    data: {
      userId,
      actionType,
      value,
    },
  })

  // Update user's total contributions
  await prisma.user.update({
    where: { id: userId },
    data: {
      totalContributions: { increment: value },
    },
  })

  // Check if any milestones should be unlocked
  const totalAggregate = await prisma.communityContribution.aggregate({
    _sum: { value: true },
  })

  const totalContributions = totalAggregate._sum.value ?? 0
  await checkMilestones(totalContributions)
}

/**
 * Get community stats: total contributions, milestones, and progress.
 */
export async function getCommunityStats(): Promise<{
  totalContributions: number
  milestones: Array<{
    id: string
    title: string
    description: string | null
    threshold: number
    rewardDescription: string
    isUnlocked: boolean
    unlockedAt: Date | null
    sortOrder: number
  }>
  currentMilestone: {
    id: string
    title: string
    description: string | null
    threshold: number
    rewardDescription: string
    isUnlocked: boolean
    unlockedAt: Date | null
    sortOrder: number
  } | null
  nextMilestone: {
    id: string
    title: string
    description: string | null
    threshold: number
    rewardDescription: string
    isUnlocked: boolean
    unlockedAt: Date | null
    sortOrder: number
  } | null
  progressPercent: number
}> {
  // Get total contributions
  const totalAggregate = await prisma.communityContribution.aggregate({
    _sum: { value: true },
  })
  const totalContributions = totalAggregate._sum.value ?? 0

  // Get all milestones ordered by threshold
  const milestones = await prisma.communityMilestone.findMany({
    orderBy: { threshold: 'asc' },
  })

  // Find current milestone (highest unlocked) and next milestone (lowest locked)
  let currentMilestone = null
  let nextMilestone = null

  for (const milestone of milestones) {
    if (milestone.isUnlocked) {
      currentMilestone = milestone
    } else if (!nextMilestone) {
      nextMilestone = milestone
    }
  }

  // Calculate progress toward next milestone
  let progressPercent = 0
  if (nextMilestone) {
    const previousThreshold = currentMilestone?.threshold ?? 0
    const range = nextMilestone.threshold - previousThreshold
    const progress = totalContributions - previousThreshold
    progressPercent = range > 0 ? Math.min(100, Math.round((progress / range) * 100)) : 0
  } else if (milestones.length > 0) {
    // All milestones unlocked
    progressPercent = 100
  }

  return {
    totalContributions,
    milestones,
    currentMilestone,
    nextMilestone,
    progressPercent,
  }
}

/**
 * Get the contribution leaderboard (top contributors).
 */
export async function getContributionLeaderboard(limit = 20) {
  const users = await prisma.user.findMany({
    where: {
      totalContributions: { gt: 0 },
    },
    orderBy: { totalContributions: 'desc' },
    take: limit,
    select: {
      id: true,
      name: true,
      image: true,
      totalContributions: true,
    },
  })

  return users.map((user, index) => ({
    rank: index + 1,
    userId: user.id,
    name: user.name ?? 'Anonymous',
    image: user.image,
    totalContributions: user.totalContributions,
  }))
}

/**
 * Check and unlock community milestones based on total contributions.
 * Finds milestones where the threshold has been reached but they're still locked.
 */
async function checkMilestones(total: number) {
  const unlockedMilestones = await prisma.communityMilestone.findMany({
    where: {
      threshold: { lte: total },
      isUnlocked: false,
    },
  })

  if (unlockedMilestones.length === 0) return

  const now = new Date()

  await prisma.communityMilestone.updateMany({
    where: {
      id: { in: unlockedMilestones.map((m) => m.id) },
    },
    data: {
      isUnlocked: true,
      unlockedAt: now,
    },
  })
}

/**
 * Get a user's total contribution count.
 */
export async function getUserContributions(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalContributions: true },
  })

  return user?.totalContributions ?? 0
}

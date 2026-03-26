import prisma from './prisma'

/**
 * Get the streak leaderboard – top users by currentStreak.
 */
export async function getStreakLeaderboard(limit = 20) {
  const users = await prisma.user.findMany({
    where: { currentStreak: { gt: 0 } },
    orderBy: { currentStreak: 'desc' },
    take: limit,
    select: {
      id: true,
      name: true,
      image: true,
      currentStreak: true,
      longestStreak: true,
    },
  })

  return users.map((user, index) => ({
    rank: index + 1,
    userId: user.id,
    name: user.name ?? 'Anonymous',
    image: user.image,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
  }))
}

/**
 * Get the contribution leaderboard – top users by totalContributions.
 */
export async function getContributionLeaderboard(limit = 20) {
  const users = await prisma.user.findMany({
    where: { totalContributions: { gt: 0 } },
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
 * Get the mission leaderboard – top users by number of mission completions.
 */
export async function getMissionLeaderboard(limit = 20) {
  const completions = await prisma.missionCompletion.groupBy({
    by: ['userId'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: limit,
  })

  if (completions.length === 0) return []

  // Fetch user details for the top users
  const userIds = completions.map((c) => c.userId)
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, image: true },
  })

  const userMap = new Map(users.map((u) => [u.id, u]))

  return completions.map((c, index) => {
    const user = userMap.get(c.userId)
    return {
      rank: index + 1,
      userId: c.userId,
      name: user?.name ?? 'Anonymous',
      image: user?.image ?? null,
      missionsCompleted: c._count.id,
    }
  })
}

/**
 * Get the entries leaderboard – top users by total entries.
 */
export async function getEntriesLeaderboard(limit = 20) {
  const users = await prisma.user.findMany({
    where: { entries: { gt: 0 } },
    orderBy: { entries: 'desc' },
    take: limit,
    select: {
      id: true,
      name: true,
      image: true,
      entries: true,
    },
  })

  return users.map((user, index) => ({
    rank: index + 1,
    userId: user.id,
    name: user.name ?? 'Anonymous',
    image: user.image,
    entries: user.entries,
  }))
}

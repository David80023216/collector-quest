import prisma from './prisma'

/**
 * Get current grand prize information based on the number of PRO subscribers.
 * Finds the matching prize tier and the next tier to display progress.
 */
export async function getGrandPrizeInfo(): Promise<{
  currentTier: { prizeValue: number; label: string }
  nextTier: { prizeValue: number; subscribersNeeded: number; label: string } | null
  proSubscriberCount: number
}> {
  const proSubscriberCount = await prisma.user.count({
    where: { plan: 'PRO' },
  })

  // Get all active prize tiers ordered by minSubscribers
  const tiers = await prisma.prizeTier.findMany({
    where: { isActive: true },
    orderBy: { minSubscribers: 'asc' },
  })

  // Find current tier (highest tier where minSubscribers <= proSubscriberCount)
  let currentTier = { prizeValue: 0, label: 'No prize yet' }
  let nextTier: { prizeValue: number; subscribersNeeded: number; label: string } | null = null

  for (let i = 0; i < tiers.length; i++) {
    const tier = tiers[i]
    if (proSubscriberCount >= tier.minSubscribers) {
      currentTier = { prizeValue: tier.prizeValue, label: tier.label }

      // Next tier is the one after this
      if (i + 1 < tiers.length) {
        const next = tiers[i + 1]
        nextTier = {
          prizeValue: next.prizeValue,
          subscribersNeeded: next.minSubscribers - proSubscriberCount,
          label: next.label,
        }
      } else {
        nextTier = null // Already at highest tier
      }
    }
  }

  // If no tier matched, the first tier is the next tier
  if (currentTier.prizeValue === 0 && tiers.length > 0) {
    const first = tiers[0]
    nextTier = {
      prizeValue: first.prizeValue,
      subscribersNeeded: first.minSubscribers - proSubscriberCount,
      label: first.label,
    }
  }

  return {
    currentTier,
    nextTier,
    proSubscriberCount,
  }
}

/**
 * Get all prize tiers, ordered by minSubscribers ascending.
 */
export async function getPrizeTiers() {
  return prisma.prizeTier.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })
}

/**
 * Get all data needed for the prize page:
 * current grand prize, next tier, available prizes, recent winners, upcoming drawings.
 */
export async function getPrizePageData() {
  const [grandPrize, prizes, recentWinners, upcomingDrawings] = await Promise.all([
    getGrandPrizeInfo(),
    prisma.prize.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.drawingWinner.findMany({
      orderBy: { wonAt: 'desc' },
      take: 10,
      include: {
        drawing: {
          select: { title: true },
        },
      },
    }),
    prisma.drawing.findMany({
      where: {
        status: { in: ['UPCOMING', 'ACTIVE'] },
      },
      orderBy: { drawDate: 'asc' },
      include: {
        prizes: true,
      },
    }),
  ])

  return {
    grandPrize,
    prizes,
    recentWinners: recentWinners.map((w) => ({
      id: w.id,
      displayName: w.displayName,
      prizeDescription: w.prizeDescription,
      prizeValue: w.prizeValue,
      wonAt: w.wonAt,
      drawingTitle: w.drawing.title,
    })),
    upcomingDrawings,
  }
}

/**
 * Get a single admin setting value by key.
 * Returns null if the setting does not exist.
 */
export async function getAdminSetting(key: string): Promise<string | null> {
  const setting = await prisma.adminSetting.findUnique({
    where: { key },
  })

  return setting?.value ?? null
}

/**
 * Get multiple admin settings at once as a key-value record.
 */
export async function getAdminSettings(
  keys: string[]
): Promise<Record<string, string>> {
  const settings = await prisma.adminSetting.findMany({
    where: { key: { in: keys } },
  })

  const result: Record<string, string> = {}
  for (const s of settings) {
    result[s.key] = s.value
  }

  return result
}

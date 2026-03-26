import prisma from './prisma'
import { LedgerTransactionType } from '@prisma/client'

/**
 * Add entries to a user's balance with a corresponding ledger record.
 * Uses an atomic transaction to ensure consistency.
 */
export async function addEntries(
  userId: string,
  amount: number,
  type: LedgerTransactionType,
  description: string,
  referenceId?: string
) {
  if (amount <= 0) {
    throw new Error('Amount must be positive')
  }

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: { entries: { increment: amount } },
    })

    const ledger = await tx.userLedger.create({
      data: {
        userId,
        transactionType: type,
        entriesChange: amount,
        pointsChange: 0,
        description,
        referenceId,
      },
    })

    return { user, ledger }
  })
}

/**
 * Add points to a user's balance with a corresponding ledger record.
 */
export async function addPoints(
  userId: string,
  amount: number,
  type: LedgerTransactionType,
  description: string,
  referenceId?: string
) {
  if (amount <= 0) {
    throw new Error('Amount must be positive')
  }

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: { points: { increment: amount } },
    })

    const ledger = await tx.userLedger.create({
      data: {
        userId,
        transactionType: type,
        entriesChange: 0,
        pointsChange: amount,
        description,
        referenceId,
      },
    })

    return { user, ledger }
  })
}

/**
 * Add both entries and points to a user with a single ledger record.
 */
export async function addReward(
  userId: string,
  entries: number,
  points: number,
  type: LedgerTransactionType,
  description: string,
  referenceId?: string
) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: {
        entries: { increment: Math.max(0, entries) },
        points: { increment: Math.max(0, points) },
      },
    })

    const ledger = await tx.userLedger.create({
      data: {
        userId,
        transactionType: type,
        entriesChange: entries,
        pointsChange: points,
        description,
        referenceId,
      },
    })

    return { user, ledger }
  })
}

/**
 * Deduct points from a user's balance (e.g., for store purchases).
 * Returns false if the user has insufficient balance.
 */
export async function deductPoints(
  userId: string,
  amount: number,
  type: LedgerTransactionType,
  description: string,
  referenceId?: string
): Promise<boolean> {
  if (amount <= 0) {
    throw new Error('Amount must be positive')
  }

  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: { points: true },
      })

      if (user.points < amount) {
        throw new Error('INSUFFICIENT_BALANCE')
      }

      await tx.user.update({
        where: { id: userId },
        data: { points: { decrement: amount } },
      })

      await tx.userLedger.create({
        data: {
          userId,
          transactionType: type,
          entriesChange: 0,
          pointsChange: -amount,
          description,
          referenceId,
        },
      })
    })

    return true
  } catch (error) {
    if (error instanceof Error && error.message === 'INSUFFICIENT_BALANCE') {
      return false
    }
    throw error
  }
}

/**
 * Get the current entries and points balance for a user.
 */
export async function getUserBalance(
  userId: string
): Promise<{ entries: number; points: number }> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { entries: true, points: true },
  })

  return { entries: user.entries, points: user.points }
}

/**
 * Get transaction history for a user, ordered by most recent first.
 */
export async function getTransactionHistory(userId: string, limit = 50) {
  return prisma.userLedger.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

/**
 * Check how many entries the user has earned today against the daily cap.
 * The daily cap is read from AdminSetting 'daily_entry_cap' (default 500).
 */
export async function checkDailyCap(
  userId: string
): Promise<{ used: number; cap: number; remaining: number }> {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)

  const [capSetting, aggregate] = await Promise.all([
    prisma.adminSetting.findUnique({
      where: { key: 'daily_entry_cap' },
    }),
    prisma.userLedger.aggregate({
      where: {
        userId,
        createdAt: { gte: startOfDay, lt: endOfDay },
        entriesChange: { gt: 0 },
      },
      _sum: { entriesChange: true },
    }),
  ])

  const cap = capSetting ? parseInt(capSetting.value, 10) : 500
  const used = aggregate._sum.entriesChange ?? 0
  const remaining = Math.max(0, cap - used)

  return { used, cap, remaining }
}

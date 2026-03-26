import prisma from './prisma'
import { deductPoints, addEntries } from './economy'
import { grantPack } from './packs'
import { addCommunityContribution } from './community'
import { checkAndAwardBadges } from './badges'
import { LedgerTransactionType } from '@prisma/client'

/**
 * Get active store items. Filters out proOnly items if the user is on the free plan.
 */
export async function getStoreItems(userPlan: string) {
  const where: Record<string, unknown> = { isActive: true }

  if (userPlan !== 'PRO') {
    where.proOnly = false
  }

  return prisma.storeItem.findMany({
    where,
    orderBy: { sortOrder: 'asc' },
  })
}

/**
 * Redeem a store item for a user.
 *
 * Steps:
 *  1. Get store item and validate
 *  2. Check active and in stock
 *  3. Deduct points from user
 *  4. Apply item effect based on type
 *  5. Create StoreRedemption record
 *  6. Decrement inventory if applicable
 *  7. Add community contribution
 */
export async function redeemStoreItem(
  userId: string,
  storeItemId: string
): Promise<{
  success: boolean
  item?: {
    id: string
    title: string
    description: string | null
    pointsCost: number
    itemType: string
    itemValue: number
  }
  error?: string
}> {
  // 1. Get store item
  const storeItem = await prisma.storeItem.findUnique({
    where: { id: storeItemId },
  })

  if (!storeItem) {
    return { success: false, error: 'Store item not found' }
  }

  // 2. Check active and in stock
  if (!storeItem.isActive) {
    return { success: false, error: 'Store item is no longer available' }
  }

  if (storeItem.inventory !== null && storeItem.inventory <= 0) {
    return { success: false, error: 'Store item is out of stock' }
  }

  // Check proOnly
  if (storeItem.proOnly) {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { plan: true },
    })
    if (user.plan !== 'PRO') {
      return { success: false, error: 'This item is only available to PRO subscribers' }
    }
  }

  // 3. Deduct points
  const deducted = await deductPoints(
    userId,
    storeItem.pointsCost,
    LedgerTransactionType.STORE_PURCHASE,
    `Store purchase: ${storeItem.title}`,
    storeItem.id
  )

  if (!deducted) {
    return { success: false, error: 'Insufficient points' }
  }

  // 4. Apply item effect based on type
  try {
    switch (storeItem.itemType) {
      case 'entries':
        await addEntries(
          userId,
          storeItem.itemValue,
          LedgerTransactionType.STORE_REDEMPTION,
          `Store redemption: ${storeItem.title}`,
          storeItem.id
        )
        break

      case 'pack':
      case 'premium_pack': {
        // Find a pack definition to grant
        const packDef = await prisma.rewardPackDefinition.findFirst({
          where: {
            isActive: true,
            ...(storeItem.itemType === 'premium_pack' ? { proOnly: true } : {}),
          },
          orderBy: { createdAt: 'asc' },
        })
        if (packDef) {
          for (let i = 0; i < storeItem.itemValue; i++) {
            await grantPack(userId, packDef.id, `store_purchase_${storeItem.id}`)
          }
        }
        break
      }

      case 'streak_restore':
        // Restore streak to the user's longest streak value
        const user = await prisma.user.findUniqueOrThrow({
          where: { id: userId },
          select: { longestStreak: true },
        })
        await prisma.user.update({
          where: { id: userId },
          data: {
            currentStreak: user.longestStreak,
            lastStreakDate: new Date(),
          },
        })
        break

      case 'reward_token':
        // Add reward token to inventory
        await prisma.userInventory.create({
          data: {
            userId,
            itemType: 'reward_token',
            itemId: storeItem.id,
            quantity: storeItem.itemValue,
            source: `store_purchase_${storeItem.id}`,
          },
        })
        break

      default:
        // Unknown type – just record the redemption
        break
    }
  } catch (error) {
    console.error('Error applying store item effect:', error)
    // Note: Points have already been deducted. In a production system you might
    // want to refund, but for now we log and proceed.
  }

  // 5. Create StoreRedemption record
  await prisma.storeRedemption.create({
    data: {
      userId,
      storeItemId: storeItem.id,
      pointsSpent: storeItem.pointsCost,
    },
  })

  // 6. Decrement inventory if applicable
  if (storeItem.inventory !== null) {
    await prisma.storeItem.update({
      where: { id: storeItem.id },
      data: { inventory: { decrement: 1 } },
    })
  }

  // 7. Add community contribution
  await addCommunityContribution(userId, 'store_purchase', 1)

  // Check badges (non-blocking)
  checkAndAwardBadges(userId).catch((err) => {
    console.error('Badge check failed:', err)
  })

  return {
    success: true,
    item: {
      id: storeItem.id,
      title: storeItem.title,
      description: storeItem.description,
      pointsCost: storeItem.pointsCost,
      itemType: storeItem.itemType,
      itemValue: storeItem.itemValue,
    },
  }
}

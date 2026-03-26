import prisma from './prisma'
import { addEntries, addPoints } from './economy'
import { addCommunityContribution } from './community'
import { checkAndAwardBadges } from './badges'
import { RewardType, LedgerTransactionType } from '@prisma/client'

interface PackReward {
  id: string
  packDefinitionId: string
  rewardType: RewardType
  rewardValue: number
  weight: number
  label: string
  description: string | null
  rarity: string
}

/**
 * Get all available packs in a user's inventory.
 */
export async function getUserPacks(userId: string) {
  return prisma.userInventory.findMany({
    where: {
      userId,
      itemType: 'pack',
      quantity: { gt: 0 },
    },
    orderBy: { acquiredAt: 'desc' },
  })
}

/**
 * Weighted random selection from an array of pack rewards.
 * Sums all weights, generates a random number, iterates to find the selection.
 */
function selectReward(rewards: PackReward[]): PackReward {
  const totalWeight = rewards.reduce((sum, r) => sum + r.weight, 0)

  if (totalWeight <= 0) {
    // Fallback: return a random reward
    return rewards[Math.floor(Math.random() * rewards.length)]
  }

  let random = Math.random() * totalWeight
  for (const reward of rewards) {
    random -= reward.weight
    if (random <= 0) {
      return reward
    }
  }

  // Fallback: return last reward
  return rewards[rewards.length - 1]
}

/**
 * Open a pack from the user's inventory.
 *
 * Steps:
 *  1. Verify pack exists in user inventory
 *  2. Get pack definition and its rewards
 *  3. Do weighted random selection
 *  4. Create RewardPackOpen record
 *  5. Apply reward (entries, points, inventory item, etc.)
 *  6. Remove pack from inventory (decrement quantity or delete)
 *  7. Add community contribution
 *  8. Return reward info
 */
export async function openPack(
  userId: string,
  inventoryId: string
): Promise<{
  success: boolean
  reward: { type: RewardType; value: number; label: string; rarity: string } | null
  error?: string
}> {
  // 1. Verify pack exists in user inventory
  const inventoryItem = await prisma.userInventory.findFirst({
    where: {
      id: inventoryId,
      userId,
      itemType: 'pack',
      quantity: { gt: 0 },
    },
  })

  if (!inventoryItem) {
    return {
      success: false,
      reward: null,
      error: 'Pack not found in inventory',
    }
  }

  // 2. Get pack definition and rewards
  const packDefinition = await prisma.rewardPackDefinition.findUnique({
    where: { id: inventoryItem.itemId ?? '' },
    include: { rewards: true },
  })

  if (!packDefinition || packDefinition.rewards.length === 0) {
    return {
      success: false,
      reward: null,
      error: 'Pack definition not found or has no rewards',
    }
  }

  // 3. Weighted random selection
  const selectedReward = selectReward(packDefinition.rewards)

  // 4. Create RewardPackOpen record
  await prisma.rewardPackOpen.create({
    data: {
      userId,
      packDefinitionId: packDefinition.id,
      rewardType: selectedReward.rewardType,
      rewardValue: selectedReward.rewardValue,
      rewardLabel: selectedReward.label,
    },
  })

  // 5. Apply reward based on type
  switch (selectedReward.rewardType) {
    case RewardType.ENTRIES:
      await addEntries(
        userId,
        selectedReward.rewardValue,
        LedgerTransactionType.PACK_REWARD,
        `Pack reward: ${selectedReward.label}`,
        packDefinition.id
      )
      break

    case RewardType.POINTS:
      await addPoints(
        userId,
        selectedReward.rewardValue,
        LedgerTransactionType.PACK_REWARD,
        `Pack reward: ${selectedReward.label}`,
        packDefinition.id
      )
      break

    case RewardType.BONUS_PACK:
      // Grant another pack
      const bonusPack = await prisma.rewardPackDefinition.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
      })
      if (bonusPack) {
        await grantPack(userId, bonusPack.id, 'bonus_pack_reward')
      }
      break

    case RewardType.STREAK_BOOST:
      // Add to streak value
      await prisma.user.update({
        where: { id: userId },
        data: {
          currentStreak: { increment: selectedReward.rewardValue },
        },
      })
      break

    case RewardType.REWARD_TOKEN:
      // Add a reward token to inventory
      await prisma.userInventory.create({
        data: {
          userId,
          itemType: 'reward_token',
          itemId: selectedReward.id,
          quantity: selectedReward.rewardValue,
          source: `pack_${packDefinition.id}`,
        },
      })
      break
  }

  // 6. Remove pack from inventory (decrement quantity or delete)
  if (inventoryItem.quantity <= 1) {
    await prisma.userInventory.delete({
      where: { id: inventoryItem.id },
    })
  } else {
    await prisma.userInventory.update({
      where: { id: inventoryItem.id },
      data: { quantity: { decrement: 1 } },
    })
  }

  // 7. Add community contribution
  await addCommunityContribution(userId, 'pack_open', 1)

  // Check badges (non-blocking)
  checkAndAwardBadges(userId).catch((err) => {
    console.error('Badge check failed:', err)
  })

  return {
    success: true,
    reward: {
      type: selectedReward.rewardType,
      value: selectedReward.rewardValue,
      label: selectedReward.label,
      rarity: selectedReward.rarity,
    },
  }
}

/**
 * Grant a pack to a user's inventory.
 * If the user already has an inventory record for this pack, increment the quantity.
 * Otherwise, create a new inventory record.
 */
export async function grantPack(
  userId: string,
  packDefinitionId: string,
  source: string
) {
  // Check if user already has this pack type in inventory
  const existing = await prisma.userInventory.findFirst({
    where: {
      userId,
      itemType: 'pack',
      itemId: packDefinitionId,
    },
  })

  if (existing) {
    await prisma.userInventory.update({
      where: { id: existing.id },
      data: { quantity: { increment: 1 } },
    })
  } else {
    await prisma.userInventory.create({
      data: {
        userId,
        itemType: 'pack',
        itemId: packDefinitionId,
        quantity: 1,
        source,
      },
    })
  }
}

import { PrismaClient, DrawingStatus } from '@prisma/client'
import { hash } from 'bcryptjs'

export async function seedOther(prisma: PrismaClient) {
  // ─── 1. Admin Settings ───────────────────────────────────────────────
  console.log('  📋 Seeding admin settings...')
  const settings = [
    { key: 'pro_price', value: '10' },
    { key: 'prize_pool_pct', value: '45' },
    { key: 'operations_pct', value: '20' },
    { key: 'margin_pct', value: '35' },
    { key: 'daily_entry_cap', value: '20' },
    { key: 'avg_engagement_target', value: '10' },
    { key: 'free_entry_daily_limit', value: '1' },
    { key: 'free_entry_weekly_limit', value: '5' },
    { key: 'daily_claim_entries', value: '5' },
    { key: 'daily_claim_points', value: '10' },
    { key: 'streak_bonus_interval', value: '7' },
    { key: 'streak_bonus_entries', value: '10' },
    { key: 'streak_bonus_points', value: '25' },
  ]
  for (const s of settings) {
    await prisma.adminSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value },
    })
  }

  // ─── 2. Admin User ──────────────────────────────────────────────────
  console.log('  👤 Seeding admin user...')
  const hashedPassword = await hash('admin123', 12)
  await prisma.user.upsert({
    where: { email: 'admin@collectorquest.com' },
    update: {},
    create: {
      email: 'admin@collectorquest.com',
      hashedPassword: hashedPassword,
      name: 'CQ Admin',
      role: 'ADMIN',
      plan: 'PRO',
    },
  })

  // ─── 3. Monthly Themes ──────────────────────────────────────────────
  console.log('  🎨 Seeding monthly themes...')
  const currentYear = new Date().getFullYear()
  await prisma.monthlyTheme.deleteMany({})
  await prisma.monthlyTheme.createMany({
    data: [
      { month: 1, year: currentYear, name: 'Rookie Month', description: 'Welcome to the big leagues! Celebrate the fresh faces and first cards that spark every great collection.' },
      { month: 2, year: currentYear, name: '90s Nostalgia Month', description: 'Break out the neon, dust off those junk wax boxes, and relive the golden era of card collecting.' },
      { month: 3, year: currentYear, name: 'Hall of Fame Month', description: 'Honor the legends of the game! Spotlights all-time greats whose cards define collecting royalty.' },
      { month: 4, year: currentYear, name: 'Team Colors Month', description: 'Rep your squad! Missions themed around your favorite franchises. Show your colors.' },
      { month: 5, year: currentYear, name: 'Insert Chase Month', description: 'The thrill of the chase is real! Dedicated to inserts, parallels, and short prints.' },
      { month: 6, year: currentYear, name: 'Collector Championship Month', description: 'The ultimate showdown! Compete against the community in the grand finale.' },
    ],
  })

  // ─── 4. Reward Pack Definitions ──────────────────────────────────────
  console.log('  📦 Seeding reward packs...')
  const packs = [
    { name: 'Standard Pack', description: 'A basic reward pack with common to uncommon prizes.', proOnly: false, rarity: 'standard', imageColor: '#4F8EF7',
      rewards: [
        { rewardType: 'ENTRIES', rewardValue: 2, label: '2 Bonus Entries', weight: 35 },
        { rewardType: 'ENTRIES', rewardValue: 5, label: '5 Bonus Entries', weight: 20 },
        { rewardType: 'POINTS', rewardValue: 10, label: '10 Bonus Points', weight: 25 },
        { rewardType: 'POINTS', rewardValue: 25, label: '25 Bonus Points', weight: 10 },
        { rewardType: 'STREAK_BOOST', rewardValue: 1, label: 'Streak Shield (1 day)', weight: 7 },
        { rewardType: 'BONUS_PACK', rewardValue: 1, label: 'Bonus Standard Pack', weight: 2 },
        { rewardType: 'REWARD_TOKEN', rewardValue: 1, label: 'Reward Token', weight: 1 },
      ],
    },
    { name: 'Premium Pack', description: 'Better odds, bigger prizes. Premium packs give collectors a shot at rare pulls.', proOnly: false, rarity: 'premium', imageColor: '#8B5CF6',
      rewards: [
        { rewardType: 'ENTRIES', rewardValue: 5, label: '5 Bonus Entries', weight: 25 },
        { rewardType: 'ENTRIES', rewardValue: 10, label: '10 Bonus Entries', weight: 15 },
        { rewardType: 'POINTS', rewardValue: 25, label: '25 Bonus Points', weight: 20 },
        { rewardType: 'POINTS', rewardValue: 50, label: '50 Bonus Points', weight: 12 },
        { rewardType: 'STREAK_BOOST', rewardValue: 2, label: 'Streak Shield (2 days)', weight: 12 },
        { rewardType: 'BONUS_PACK', rewardValue: 1, label: 'Bonus Premium Pack', weight: 8 },
        { rewardType: 'ENTRIES', rewardValue: 25, label: '25 Bonus Entries', weight: 5 },
        { rewardType: 'REWARD_TOKEN', rewardValue: 1, label: 'Reward Token', weight: 3 },
      ],
    },
    { name: 'Streak Pack', description: 'Earned through dedication! Streak packs reward consistent collectors.', proOnly: false, rarity: 'streak', imageColor: '#F59E0B',
      rewards: [
        { rewardType: 'ENTRIES', rewardValue: 3, label: '3 Bonus Entries', weight: 25 },
        { rewardType: 'ENTRIES', rewardValue: 8, label: '8 Bonus Entries', weight: 15 },
        { rewardType: 'POINTS', rewardValue: 15, label: '15 Bonus Points', weight: 20 },
        { rewardType: 'STREAK_BOOST', rewardValue: 1, label: 'Streak Shield (1 day)', weight: 18 },
        { rewardType: 'STREAK_BOOST', rewardValue: 3, label: 'Streak Shield (3 days)', weight: 10 },
        { rewardType: 'BONUS_PACK', rewardValue: 1, label: 'Bonus Streak Pack', weight: 8 },
        { rewardType: 'REWARD_TOKEN', rewardValue: 1, label: 'Reward Token', weight: 4 },
      ],
    },
    { name: 'Community Pack', description: 'Unlocked by the power of the community! Celebrates collective achievements.', proOnly: false, rarity: 'community', imageColor: '#10B981',
      rewards: [
        { rewardType: 'ENTRIES', rewardValue: 5, label: '5 Bonus Entries', weight: 28 },
        { rewardType: 'ENTRIES', rewardValue: 15, label: '15 Bonus Entries', weight: 10 },
        { rewardType: 'POINTS', rewardValue: 20, label: '20 Bonus Points', weight: 22 },
        { rewardType: 'POINTS', rewardValue: 50, label: '50 Bonus Points', weight: 8 },
        { rewardType: 'STREAK_BOOST', rewardValue: 2, label: 'Streak Shield (2 days)', weight: 14 },
        { rewardType: 'BONUS_PACK', rewardValue: 1, label: 'Bonus Community Pack', weight: 10 },
        { rewardType: 'ENTRIES', rewardValue: 30, label: '30 Bonus Entries', weight: 5 },
        { rewardType: 'REWARD_TOKEN', rewardValue: 1, label: 'Reward Token', weight: 3 },
      ],
    },
    { name: 'Pro Pack', description: 'Exclusive to Pro members! The best odds and biggest rewards in the game.', proOnly: true, rarity: 'pro', imageColor: '#EF4444',
      rewards: [
        { rewardType: 'ENTRIES', rewardValue: 10, label: '10 Bonus Entries', weight: 22 },
        { rewardType: 'ENTRIES', rewardValue: 25, label: '25 Bonus Entries', weight: 15 },
        { rewardType: 'POINTS', rewardValue: 50, label: '50 Bonus Points', weight: 18 },
        { rewardType: 'POINTS', rewardValue: 100, label: '100 Bonus Points', weight: 10 },
        { rewardType: 'STREAK_BOOST', rewardValue: 3, label: 'Streak Shield (3 days)', weight: 12 },
        { rewardType: 'BONUS_PACK', rewardValue: 1, label: 'Bonus Pro Pack', weight: 10 },
        { rewardType: 'ENTRIES', rewardValue: 50, label: '50 Bonus Entries', weight: 5 },
        { rewardType: 'REWARD_TOKEN', rewardValue: 2, label: '2 Reward Tokens', weight: 8 },
      ],
    },
  ]

  for (const pack of packs) {
    const { rewards, ...packData } = pack
    let existing = await prisma.rewardPackDefinition.findFirst({ where: { name: packData.name } })
    if (!existing) {
      existing = await prisma.rewardPackDefinition.create({ data: packData })
    } else {
      existing = await prisma.rewardPackDefinition.update({ where: { id: existing.id }, data: packData })
    }
    await prisma.rewardPackReward.deleteMany({ where: { packDefinitionId: existing.id } })
    await prisma.rewardPackReward.createMany({
      data: rewards.map((r) => ({
        rewardType: r.rewardType as any,
        rewardValue: r.rewardValue,
        label: r.label,
        weight: r.weight,
        packDefinitionId: existing!.id,
      })),
    })
  }

  // ─── 5. Store Items ──────────────────────────────────────────────────
  console.log('  🏪 Seeding store items...')
  const storeItems = [
    { title: 'Bonus Entries (10)', description: 'Add 10 extra entries to the next drawing.', pointsCost: 100, itemType: 'entries', itemValue: 10, proOnly: false, sortOrder: 1 },
    { title: 'Bonus Entries (25)', description: 'A hefty stack of 25 bonus entries. Boost your chances!', pointsCost: 200, itemType: 'entries', itemValue: 25, proOnly: false, sortOrder: 2 },
    { title: 'Standard Pack', description: 'Purchase a Standard Pack and test your luck.', pointsCost: 150, itemType: 'standard_pack', itemValue: 1, proOnly: false, sortOrder: 3 },
    { title: 'Premium Pack', description: 'Upgrade to a Premium Pack for better odds.', pointsCost: 300, itemType: 'premium_pack', itemValue: 1, proOnly: false, sortOrder: 4 },
    { title: 'Streak Restore', description: 'Oops! Missed a day? Restore your streak.', pointsCost: 250, itemType: 'streak_boost', itemValue: 1, proOnly: false, sortOrder: 5 },
    { title: 'Reward Token', description: 'A rare token redeemable for exclusive prizes.', pointsCost: 500, itemType: 'reward_token', itemValue: 1, proOnly: false, sortOrder: 6 },
    { title: 'Pro Pack', description: 'The ultimate pack, exclusive to Pro members.', pointsCost: 400, itemType: 'premium_pack', itemValue: 1, proOnly: true, sortOrder: 7 },
    { title: 'Mega Entries (50)', description: 'Go big or go home! 50 entries to massively boost your odds.', pointsCost: 450, itemType: 'entries', itemValue: 50, proOnly: false, sortOrder: 8 },
  ]
  for (const item of storeItems) {
    const existing = await prisma.storeItem.findFirst({ where: { title: item.title } })
    if (!existing) {
      await prisma.storeItem.create({ data: item })
    } else {
      await prisma.storeItem.update({ where: { id: existing.id }, data: item })
    }
  }

  // ─── 6. Badges ───────────────────────────────────────────────────────
  console.log('  🏅 Seeding badges...')
  const badges = [
    { name: 'First Steps', description: 'Complete your first mission.', icon: '👣', requirement: 'missions_completed', requiredValue: 1, category: 'missions' },
    { name: '7-Day Streak', description: 'Maintain a 7-day login streak.', icon: '🔥', requirement: 'streak_days', requiredValue: 7, category: 'streak' },
    { name: '30-Day Streak', description: 'An incredible 30-day streak!', icon: '💎', requirement: 'streak_days', requiredValue: 30, category: 'streak' },
    { name: 'Mission Master', description: 'Complete 50 missions total.', icon: '🎯', requirement: 'missions_completed', requiredValue: 50, category: 'missions' },
    { name: 'Pack Opener', description: 'Open 10 reward packs.', icon: '📦', requirement: 'packs_opened', requiredValue: 10, category: 'packs' },
    { name: 'Pack Collector', description: 'Open 50 reward packs.', icon: '🎁', requirement: 'packs_opened', requiredValue: 50, category: 'packs' },
    { name: 'Community Booster', description: 'Make 100 community contributions.', icon: '🤝', requirement: 'contributions', requiredValue: 100, category: 'community' },
    { name: 'Monthly Finisher', description: 'Complete all missions in a single month.', icon: '🏆', requirement: 'monthly_complete', requiredValue: 1, category: 'monthly' },
    { name: 'Trivia Champion', description: 'Answer 25 trivia questions correctly.', icon: '🧠', requirement: 'trivia_correct', requiredValue: 25, category: 'trivia' },
    { name: 'Point Spender', description: 'Spend 1,000 points in the store.', icon: '💰', requirement: 'points_spent', requiredValue: 1000, category: 'store' },
  ]
  for (const b of badges) {
    const existing = await prisma.badge.findFirst({ where: { name: b.name } })
    if (!existing) {
      await prisma.badge.create({ data: b })
    } else {
      await prisma.badge.update({ where: { id: existing.id }, data: b })
    }
  }

  // ─── 7. Prize Tiers ─────────────────────────────────────────────────
  console.log('  🎰 Seeding prize tiers...')
  await prisma.prizeTier.deleteMany({})
  await prisma.prizeTier.createMany({
    data: [
      { minSubscribers: 0, maxSubscribers: 99, prizeValue: 100, label: 'Starter Tier', sortOrder: 1 },
      { minSubscribers: 100, maxSubscribers: 249, prizeValue: 250, label: 'Bronze Tier', sortOrder: 2 },
      { minSubscribers: 250, maxSubscribers: 499, prizeValue: 500, label: 'Silver Tier', sortOrder: 3 },
      { minSubscribers: 500, maxSubscribers: 999, prizeValue: 1000, label: 'Gold Tier', sortOrder: 4 },
      { minSubscribers: 1000, maxSubscribers: null, prizeValue: 2500, label: 'Platinum Tier', sortOrder: 5 },
    ],
  })

  // ─── 8. Community Milestones ────────────────────────────────────────
  console.log('  🌍 Seeding community milestones...')
  await prisma.communityMilestone.deleteMany({})
  await prisma.communityMilestone.createMany({
    data: [
      { title: 'Community Kickoff', description: '1,000 contributions unlocked!', threshold: 1000, rewardDescription: 'Bonus entries for all active members', sortOrder: 1 },
      { title: 'Rising Tide', description: 'A rising tide lifts all collectors. 5,000 contributions!', threshold: 5000, rewardDescription: 'Community Pack unlocked for everyone', sortOrder: 2 },
      { title: 'Halfway Heroes', description: '10,000 contributions and counting.', threshold: 10000, rewardDescription: 'Premium Community Pack unlocked', sortOrder: 3 },
      { title: 'Silver Surge', description: '25,000 contributions and counting.', threshold: 25000, rewardDescription: 'Bonus drawing entry for all participants', sortOrder: 4 },
      { title: 'Golden Wave', description: '50,000 contributions from our amazing community.', threshold: 50000, rewardDescription: 'Gold Community Pack for all members', sortOrder: 5 },
      { title: 'Platinum Push', description: '100,000 contributions — unstoppable!', threshold: 100000, rewardDescription: 'Extra prize slot added to monthly drawing', sortOrder: 6 },
      { title: 'Diamond Collective', description: 'A quarter million contributions. Legendary.', threshold: 250000, rewardDescription: 'Diamond Pack unlocked for all members', sortOrder: 7 },
      { title: 'Hall of Fame', description: '500,000 contributions. This community is immortal.', threshold: 500000, rewardDescription: 'Grand bonus prize added to the next drawing', sortOrder: 8 },
    ],
  })

  // ─── 9. Drawing ──────────────────────────────────────────────────────
  console.log('  🎲 Seeding drawing...')
  const now = new Date()
  const drawDate = new Date(now.getFullYear(), now.getMonth() + 1, 1, 20, 0, 0)
  const existingDrawing = await prisma.drawing.findFirst({ where: { status: DrawingStatus.UPCOMING } })
  if (!existingDrawing) {
    await prisma.drawing.create({
      data: {
        title: 'Monthly Grand Drawing',
        description: 'The next monthly grand drawing! Earn entries all month for a shot at the grand prize.',
        drawDate,
        status: DrawingStatus.UPCOMING,
        prizeDescription: 'Patrick Mahomes II 2017 Panini Score #403 RC PSA 10',
        prizeValue: 250,
        cardTitle: 'Patrick Mahomes II Rookie Card',
        cardPlayer: 'Patrick Mahomes II',
        cardYear: '2017',
        cardBrand: 'Panini Score',
        cardGrade: 'PSA 10',
        cardNumber: '#403',
        cardImageUrl: 'https://cdn-vault.fanaticscollect.com/2026/3/2/rm1/medium/v2814279_2021030106085391R_101.jpg',
      },
    })
  } else if (!existingDrawing.cardPlayer) {
    // Backfill card data on existing drawing that was seeded without it
    await prisma.drawing.update({
      where: { id: existingDrawing.id },
      data: {
        prizeDescription: 'Patrick Mahomes II 2017 Panini Score #403 RC PSA 10',
        prizeValue: 250,
        cardTitle: 'Patrick Mahomes II Rookie Card',
        cardPlayer: 'Patrick Mahomes II',
        cardYear: '2017',
        cardBrand: 'Panini Score',
        cardGrade: 'PSA 10',
        cardNumber: '#403',
        cardImageUrl: 'https://cdn-vault.fanaticscollect.com/2026/3/2/rm1/medium/v2814279_2021030106085391R_101.jpg',
      },
    })
  }

  console.log('  ✅ Other seed data complete.')
}

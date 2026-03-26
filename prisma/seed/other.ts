import { PrismaClient, RewardType, DrawingStatus } from '@prisma/client'
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
      password: hashedPassword,
      name: 'CQ Admin',
      role: 'ADMIN',
      plan: 'PRO',
    },
  })

  // ─── 3. Monthly Themes ──────────────────────────────────────────────
  console.log('  🎨 Seeding monthly themes...')
  const themes = [
    {
      month: 1,
      name: 'Rookie Month',
      description:
        'Welcome to the big leagues! This month is all about celebrating the fresh faces and first cards that spark every great collection. Complete missions, earn rookie rewards, and prove you belong!',
    },
    {
      month: 2,
      name: '90s Nostalgia Month',
      description:
        'Break out the neon, dust off those junk wax boxes, and relive the golden era of card collecting. From Griffey rookies to Jordan inserts, this month is a trip down memory lane.',
    },
    {
      month: 3,
      name: 'Hall of Fame Month',
      description:
        'Honor the legends of the game! This month spotlights the all-time greats whose cards define collecting royalty. Chase legendary rewards and immortalize your collection.',
    },
    {
      month: 4,
      name: 'Team Colors Month',
      description:
        'Rep your squad! This month celebrates team pride with missions themed around your favorite franchises. Show your colors and earn exclusive team-inspired rewards.',
    },
    {
      month: 5,
      name: 'Insert Chase Month',
      description:
        'The thrill of the chase is real! This month is dedicated to the inserts, parallels, and short prints that make collectors hearts race. Hunt for rare rewards and elusive bonus packs.',
    },
    {
      month: 6,
      name: 'Collector Championship Month',
      description:
        'The ultimate showdown! Compete against the community in the grand finale. Top the leaderboards, finish every mission, and claim the championship title. Who will be crowned Collector of the Year?',
    },
  ]
  for (const t of themes) {
    await prisma.monthlyTheme.upsert({
      where: { month: t.month },
      update: { name: t.name, description: t.description },
      create: t,
    })
  }

  // ─── 7. Reward Pack Definitions ──────────────────────────────────────
  console.log('  📦 Seeding reward packs...')
  const packs = [
    {
      slug: 'standard-pack',
      name: 'Standard Pack',
      description: 'A basic reward pack with common to uncommon prizes. A solid pull for any collector.',
      proOnly: false,
      rewards: [
        { rewardType: RewardType.ENTRIES, rewardValue: 2, label: '2 Bonus Entries', weight: 35 },
        { rewardType: RewardType.ENTRIES, rewardValue: 5, label: '5 Bonus Entries', weight: 20 },
        { rewardType: RewardType.POINTS, rewardValue: 10, label: '10 Bonus Points', weight: 25 },
        { rewardType: RewardType.POINTS, rewardValue: 25, label: '25 Bonus Points', weight: 10 },
        { rewardType: RewardType.STREAK_BOOST, rewardValue: 1, label: 'Streak Shield (1 day)', weight: 7 },
        { rewardType: RewardType.BONUS_PACK, rewardValue: 1, label: 'Bonus Standard Pack', weight: 2 },
        { rewardType: RewardType.REWARD_TOKEN, rewardValue: 1, label: 'Reward Token', weight: 1 },
      ],
    },
    {
      slug: 'premium-pack',
      name: 'Premium Pack',
      description: 'Better odds, bigger prizes. Premium packs give collectors a shot at rare pulls.',
      proOnly: false,
      rewards: [
        { rewardType: RewardType.ENTRIES, rewardValue: 5, label: '5 Bonus Entries', weight: 25 },
        { rewardType: RewardType.ENTRIES, rewardValue: 10, label: '10 Bonus Entries', weight: 15 },
        { rewardType: RewardType.POINTS, rewardValue: 25, label: '25 Bonus Points', weight: 20 },
        { rewardType: RewardType.POINTS, rewardValue: 50, label: '50 Bonus Points', weight: 12 },
        { rewardType: RewardType.STREAK_BOOST, rewardValue: 2, label: 'Streak Shield (2 days)', weight: 12 },
        { rewardType: RewardType.BONUS_PACK, rewardValue: 1, label: 'Bonus Premium Pack', weight: 8 },
        { rewardType: RewardType.ENTRIES, rewardValue: 25, label: '25 Bonus Entries', weight: 5 },
        { rewardType: RewardType.REWARD_TOKEN, rewardValue: 1, label: 'Reward Token', weight: 3 },
      ],
    },
    {
      slug: 'streak-pack',
      name: 'Streak Pack',
      description: 'Earned through dedication! Streak packs reward consistent collectors with streak-boosting prizes.',
      proOnly: false,
      rewards: [
        { rewardType: RewardType.ENTRIES, rewardValue: 3, label: '3 Bonus Entries', weight: 25 },
        { rewardType: RewardType.ENTRIES, rewardValue: 8, label: '8 Bonus Entries', weight: 15 },
        { rewardType: RewardType.POINTS, rewardValue: 15, label: '15 Bonus Points', weight: 20 },
        { rewardType: RewardType.STREAK_BOOST, rewardValue: 1, label: 'Streak Shield (1 day)', weight: 18 },
        { rewardType: RewardType.STREAK_BOOST, rewardValue: 3, label: 'Streak Shield (3 days)', weight: 10 },
        { rewardType: RewardType.BONUS_PACK, rewardValue: 1, label: 'Bonus Streak Pack', weight: 8 },
        { rewardType: RewardType.REWARD_TOKEN, rewardValue: 1, label: 'Reward Token', weight: 4 },
      ],
    },
    {
      slug: 'community-pack',
      name: 'Community Pack',
      description: 'Unlocked by the power of the community! These packs celebrate collective achievements.',
      proOnly: false,
      rewards: [
        { rewardType: RewardType.ENTRIES, rewardValue: 5, label: '5 Bonus Entries', weight: 28 },
        { rewardType: RewardType.ENTRIES, rewardValue: 15, label: '15 Bonus Entries', weight: 10 },
        { rewardType: RewardType.POINTS, rewardValue: 20, label: '20 Bonus Points', weight: 22 },
        { rewardType: RewardType.POINTS, rewardValue: 50, label: '50 Bonus Points', weight: 8 },
        { rewardType: RewardType.STREAK_BOOST, rewardValue: 2, label: 'Streak Shield (2 days)', weight: 14 },
        { rewardType: RewardType.BONUS_PACK, rewardValue: 1, label: 'Bonus Community Pack', weight: 10 },
        { rewardType: RewardType.ENTRIES, rewardValue: 30, label: '30 Bonus Entries', weight: 5 },
        { rewardType: RewardType.REWARD_TOKEN, rewardValue: 1, label: 'Reward Token', weight: 3 },
      ],
    },
    {
      slug: 'pro-pack',
      name: 'Pro Pack',
      description: 'Exclusive to Pro members! The best odds and biggest rewards in the game.',
      proOnly: true,
      rewards: [
        { rewardType: RewardType.ENTRIES, rewardValue: 10, label: '10 Bonus Entries', weight: 22 },
        { rewardType: RewardType.ENTRIES, rewardValue: 25, label: '25 Bonus Entries', weight: 15 },
        { rewardType: RewardType.POINTS, rewardValue: 50, label: '50 Bonus Points', weight: 18 },
        { rewardType: RewardType.POINTS, rewardValue: 100, label: '100 Bonus Points', weight: 10 },
        { rewardType: RewardType.STREAK_BOOST, rewardValue: 3, label: 'Streak Shield (3 days)', weight: 12 },
        { rewardType: RewardType.BONUS_PACK, rewardValue: 1, label: 'Bonus Pro Pack', weight: 10 },
        { rewardType: RewardType.ENTRIES, rewardValue: 50, label: '50 Bonus Entries', weight: 5 },
        { rewardType: RewardType.REWARD_TOKEN, rewardValue: 2, label: '2 Reward Tokens', weight: 8 },
      ],
    },
  ]

  for (const pack of packs) {
    const { rewards, ...packData } = pack
    const created = await prisma.rewardPack.upsert({
      where: { slug: packData.slug },
      update: { name: packData.name, description: packData.description, proOnly: packData.proOnly },
      create: packData,
    })
    // Delete existing rewards and re-create
    await prisma.rewardPackReward.deleteMany({ where: { packId: created.id } })
    await prisma.rewardPackReward.createMany({
      data: rewards.map((r) => ({ ...r, packId: created.id })),
    })
  }

  // ─── 8. Store Items ──────────────────────────────────────────────────
  console.log('  🏪 Seeding store items...')
  const storeItems = [
    { slug: 'bonus-entries-10', name: 'Bonus Entries (10)', description: 'Add 10 extra entries to the next drawing.', pointsCost: 100, rewardType: RewardType.ENTRIES, rewardValue: 10, proOnly: false, sortOrder: 1 },
    { slug: 'bonus-entries-25', name: 'Bonus Entries (25)', description: 'A hefty stack of 25 bonus entries. Boost your chances!', pointsCost: 200, rewardType: RewardType.ENTRIES, rewardValue: 25, proOnly: false, sortOrder: 2 },
    { slug: 'standard-pack-store', name: 'Standard Pack', description: 'Purchase a Standard Pack and test your luck.', pointsCost: 150, rewardType: RewardType.BONUS_PACK, rewardValue: 1, proOnly: false, sortOrder: 3 },
    { slug: 'premium-pack-store', name: 'Premium Pack', description: 'Upgrade to a Premium Pack for better odds at rare rewards.', pointsCost: 300, rewardType: RewardType.BONUS_PACK, rewardValue: 1, proOnly: false, sortOrder: 4 },
    { slug: 'streak-restore', name: 'Streak Restore', description: 'Oops! Missed a day? Restore your streak and keep the momentum going.', pointsCost: 250, rewardType: RewardType.STREAK_BOOST, rewardValue: 1, proOnly: false, sortOrder: 5 },
    { slug: 'reward-token', name: 'Reward Token', description: 'A rare token redeemable for exclusive prizes. Collect them all!', pointsCost: 500, rewardType: RewardType.REWARD_TOKEN, rewardValue: 1, proOnly: false, sortOrder: 6 },
    { slug: 'pro-pack-store', name: 'Pro Pack', description: 'The ultimate pack, exclusive to Pro members. Maximum rewards inside.', pointsCost: 400, rewardType: RewardType.BONUS_PACK, rewardValue: 1, proOnly: true, sortOrder: 7 },
    { slug: 'mega-entries-50', name: 'Mega Entries (50)', description: 'Go big or go home! 50 entries to massively boost your drawing odds.', pointsCost: 450, rewardType: RewardType.ENTRIES, rewardValue: 50, proOnly: false, sortOrder: 8 },
  ]
  for (const item of storeItems) {
    await prisma.storeItem.upsert({
      where: { slug: item.slug },
      update: { name: item.name, description: item.description, pointsCost: item.pointsCost, rewardType: item.rewardType, rewardValue: item.rewardValue, proOnly: item.proOnly, sortOrder: item.sortOrder },
      create: item,
    })
  }

  // ─── 9. Badges ───────────────────────────────────────────────────────
  console.log('  🏅 Seeding badges...')
  const badges = [
    { slug: 'first-steps', name: 'First Steps', description: 'Complete your first mission and start your collecting journey.', icon: '👣', requiredValue: 1, category: 'missions' },
    { slug: '7-day-streak', name: '7-Day Streak', description: 'Maintain a login streak for 7 consecutive days. Consistency is king!', icon: '🔥', requiredValue: 7, category: 'streak' },
    { slug: '30-day-streak', name: '30-Day Streak', description: 'An incredible 30-day streak! You are a true dedicated collector.', icon: '💎', requiredValue: 30, category: 'streak' },
    { slug: 'mission-master', name: 'Mission Master', description: 'Complete 50 missions total. You have mastered the art of the quest.', icon: '🎯', requiredValue: 50, category: 'missions' },
    { slug: 'pack-opener', name: 'Pack Opener', description: 'Open 10 reward packs. The thrill of the rip never gets old!', icon: '📦', requiredValue: 10, category: 'packs' },
    { slug: 'pack-collector', name: 'Pack Collector', description: 'Open 50 reward packs. You are a certified pack-ripping machine.', icon: '🎁', requiredValue: 50, category: 'packs' },
    { slug: 'community-booster', name: 'Community Booster', description: 'Make 100 community contributions. The community thrives because of you.', icon: '🤝', requiredValue: 100, category: 'community' },
    { slug: 'monthly-finisher', name: 'Monthly Finisher', description: 'Complete all missions in a single month. Total domination!', icon: '🏆', requiredValue: 1, category: 'monthly' },
    { slug: 'trivia-champion', name: 'Trivia Champion', description: 'Answer 25 trivia questions correctly. A true sports card scholar.', icon: '🧠', requiredValue: 25, category: 'trivia' },
    { slug: 'point-spender', name: 'Point Spender', description: 'Spend 1,000 points in the store. Shop till you drop!', icon: '💰', requiredValue: 1000, category: 'store' },
  ]
  for (const b of badges) {
    await prisma.badge.upsert({
      where: { slug: b.slug },
      update: { name: b.name, description: b.description, icon: b.icon, requiredValue: b.requiredValue, category: b.category },
      create: b,
    })
  }

  // ─── 10. Prize Tiers ─────────────────────────────────────────────────
  console.log('  🎰 Seeding prize tiers...')
  const prizeTiers = [
    { minSubscribers: 0, maxSubscribers: 99, prizeAmount: 100, label: 'Starter Tier' },
    { minSubscribers: 100, maxSubscribers: 249, prizeAmount: 250, label: 'Bronze Tier' },
    { minSubscribers: 250, maxSubscribers: 499, prizeAmount: 500, label: 'Silver Tier' },
    { minSubscribers: 500, maxSubscribers: 999, prizeAmount: 1000, label: 'Gold Tier' },
    { minSubscribers: 1000, maxSubscribers: 999999, prizeAmount: 2500, label: 'Platinum Tier' },
  ]
  for (const tier of prizeTiers) {
    await prisma.prizeTier.upsert({
      where: { minSubscribers: tier.minSubscribers },
      update: { maxSubscribers: tier.maxSubscribers, prizeAmount: tier.prizeAmount, label: tier.label },
      create: tier,
    })
  }

  // ─── 11. Community Milestones ────────────────────────────────────────
  console.log('  🌍 Seeding community milestones...')
  const milestones = [
    { targetContributions: 1000, name: 'Community Kickoff', description: 'The community has kicked things off! 1,000 contributions unlocked.', rewardDescription: 'Bonus entries for all active members' },
    { targetContributions: 5000, name: 'Rising Tide', description: 'A rising tide lifts all collectors. 5,000 contributions strong!', rewardDescription: 'Community Pack unlocked for everyone' },
    { targetContributions: 10000, name: 'Halfway Heroes', description: 'Halfway to greatness! The community has rallied together for 10,000 contributions.', rewardDescription: 'Premium Community Pack unlocked' },
    { targetContributions: 25000, name: 'Silver Surge', description: 'A silver surge of activity! 25,000 contributions and counting.', rewardDescription: 'Bonus drawing entry for all participants' },
    { targetContributions: 50000, name: 'Golden Wave', description: 'The golden wave has arrived! 50,000 contributions from our amazing community.', rewardDescription: 'Gold Community Pack for all members' },
    { targetContributions: 100000, name: 'Platinum Push', description: 'Platinum status achieved! 100,000 contributions prove this community is unstoppable.', rewardDescription: 'Extra prize slot added to monthly drawing' },
    { targetContributions: 250000, name: 'Diamond Collective', description: 'The Diamond Collective shines! A quarter million contributions. Legendary.', rewardDescription: 'Diamond Pack unlocked for all members' },
    { targetContributions: 500000, name: 'Hall of Fame', description: 'Welcome to the Hall of Fame! 500,000 contributions. This community is immortal.', rewardDescription: 'Grand bonus prize added to the next drawing' },
  ]
  for (const m of milestones) {
    await prisma.communityMilestone.upsert({
      where: { targetContributions: m.targetContributions },
      update: { name: m.name, description: m.description, rewardDescription: m.rewardDescription },
      create: m,
    })
  }

  // ─── 12. Prizes ──────────────────────────────────────────────────────
  console.log('  🏆 Seeding prizes...')
  const prizes = [
    { slug: 'monthly-grand-prize', name: 'Monthly Grand Prize', description: 'The big one! Our flagship monthly prize awarded to one lucky collector via the grand drawing.', active: true },
    { slug: 'weekly-mini-drawing', name: 'Weekly Mini Drawing', description: 'A smaller weekly drawing with faster odds. Quick wins for active collectors.', active: true },
    { slug: 'community-milestone-bonus', name: 'Community Milestone Bonus', description: 'Bonus prize unlocked when the community hits contribution milestones together.', active: true },
    { slug: 'pro-member-exclusive', name: 'Pro Member Exclusive', description: 'An exclusive prize only available to Pro subscribers. Another perk of going Pro!', active: true },
    { slug: 'streak-master-prize', name: 'Streak Master Prize', description: 'Reserved for the most dedicated streak holders. Maintain an epic streak to qualify.', active: true },
  ]
  for (const p of prizes) {
    await prisma.prize.upsert({
      where: { slug: p.slug },
      update: { name: p.name, description: p.description, active: p.active },
      create: p,
    })
  }

  // ─── 13. Drawings ────────────────────────────────────────────────────
  console.log('  🎲 Seeding drawings...')
  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59)
  const nextWeekStart = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const nextWeekEnd = new Date(nextWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000)

  const monthlyPrize = await prisma.prize.findUnique({ where: { slug: 'monthly-grand-prize' } })
  const weeklyPrize = await prisma.prize.findUnique({ where: { slug: 'weekly-mini-drawing' } })

  if (monthlyPrize) {
    await prisma.drawing.upsert({
      where: { slug: 'monthly-grand-drawing-next' },
      update: {},
      create: {
        slug: 'monthly-grand-drawing-next',
        name: 'Monthly Grand Drawing',
        description: 'The next monthly grand drawing! Earn entries all month for a shot at the grand prize.',
        prizeId: monthlyPrize.id,
        startDate: nextMonth,
        endDate: endOfNextMonth,
        status: DrawingStatus.UPCOMING,
      },
    })
  }

  if (weeklyPrize) {
    await prisma.drawing.upsert({
      where: { slug: 'weekly-mini-drawing-next' },
      update: {},
      create: {
        slug: 'weekly-mini-drawing-next',
        name: 'Weekly Mini Drawing',
        description: 'A quick weekly drawing with great odds. Stay active and you could win!',
        prizeId: weeklyPrize.id,
        startDate: nextWeekStart,
        endDate: nextWeekEnd,
        status: DrawingStatus.UPCOMING,
      },
    })
  }

  console.log('  ✅ Other seed data complete.')
}

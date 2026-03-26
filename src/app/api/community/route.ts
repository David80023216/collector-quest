import { NextResponse } from 'next/server'
import { getCommunityStats, getContributionLeaderboard } from '@/lib/community'

export async function GET() {
  const [stats, leaderboard] = await Promise.all([getCommunityStats(), getContributionLeaderboard(10)])
  return NextResponse.json({ stats, leaderboard })
}

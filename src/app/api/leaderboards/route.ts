import { NextRequest, NextResponse } from 'next/server'
import { getEntriesLeaderboard, getStreakLeaderboard, getMissionLeaderboard, getContributionLeaderboard } from '@/lib/leaderboards'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') ?? 'entries'
  const limit = parseInt(searchParams.get('limit') ?? '25')

  let data: any[] = []
  switch (type) {
    case 'streak': data = await getStreakLeaderboard(limit); break
    case 'missions': data = await getMissionLeaderboard(limit); break
    case 'contribution': data = await getContributionLeaderboard(limit); break
    default: data = await getEntriesLeaderboard(limit); break
  }
  return NextResponse.json({ data })
}

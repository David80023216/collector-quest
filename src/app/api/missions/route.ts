import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getTodaysMissions, getMissionStats } from '@/lib/missions'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id

  const [missions, stats] = await Promise.all([getTodaysMissions(userId), getMissionStats(userId)])
  return NextResponse.json({ missions, stats })
}

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { claimDailyReward, canClaimDaily } from '@/lib/daily-reward'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id

  const eligible = await canClaimDaily(userId)
  if (!eligible) return NextResponse.json({ error: 'Already claimed today' }, { status: 400 })

  const result = await claimDailyReward(userId)
  return NextResponse.json(result)
}

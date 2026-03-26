import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { completeMission } from '@/lib/missions'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id
  const { missionId } = await req.json()
  if (!missionId) return NextResponse.json({ error: 'missionId required' }, { status: 400 })

  const result = await completeMission(userId, missionId)
  return NextResponse.json(result)
}

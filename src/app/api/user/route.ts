import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, name: true, email: true, plan: true, role: true, entries: true, points: true,
      currentStreak: true, longestStreak: true, totalContributions: true, createdAt: true,
      _count: { select: { userBadges: true, missionCompletions: true, rewardPackOpens: true } },
    },
  })
  return NextResponse.json({ user })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id
  const { name } = await req.json()
  const user = await prisma.user.update({ where: { id: userId }, data: { name }, select: { name: true } })
  return NextResponse.json({ user })
}

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getStoreItems } from '@/lib/store'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { points: true, plan: true } })
  const items = await getStoreItems(user?.plan ?? 'FREE')
  return NextResponse.json({ items, userPoints: user?.points ?? 0 })
}

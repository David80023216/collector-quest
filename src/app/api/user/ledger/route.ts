import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id
  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') ?? '50')
  const transactions = await prisma.userLedger.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
  return NextResponse.json({ transactions })
}

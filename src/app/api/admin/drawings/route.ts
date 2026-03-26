import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

async function isAdmin(session: any) {
  return session?.user && (session.user as any).role === 'ADMIN'
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!(await isAdmin(session))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const drawings = await prisma.drawing.findMany({
    orderBy: { drawDate: 'desc' },
    include: { winners: { select: { id: true, displayName: true } } },
  })
  return NextResponse.json({ drawings })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!(await isAdmin(session))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { title, description, drawDate, prizeDescription, prizeValue } = await req.json()
  if (!title || !drawDate || !prizeDescription) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  const drawing = await prisma.drawing.create({
    data: {
      title, description, drawDate: new Date(drawDate), prizeDescription,
      prizeValue: prizeValue ? parseFloat(prizeValue) : null,
      status: 'UPCOMING',
    },
  })
  return NextResponse.json({ drawing })
}

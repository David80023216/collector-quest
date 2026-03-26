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
  const settings = await prisma.adminSetting.findMany({ orderBy: { key: 'asc' } })
  return NextResponse.json({ settings })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!(await isAdmin(session))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { key, value } = await req.json()
  const setting = await prisma.adminSetting.update({ where: { key }, data: { value } })
  return NextResponse.json({ setting })
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { openPack } from '@/lib/packs'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id
  const { inventoryId } = await req.json()
  if (!inventoryId) return NextResponse.json({ error: 'inventoryId required' }, { status: 400 })
  const result = await openPack(userId, inventoryId)
  return NextResponse.json(result)
}

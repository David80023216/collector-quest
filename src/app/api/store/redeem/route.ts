import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redeemStoreItem } from '@/lib/store'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id
  const { storeItemId } = await req.json()
  if (!storeItemId) return NextResponse.json({ error: 'storeItemId required' }, { status: 400 })
  const result = await redeemStoreItem(userId, storeItemId)
  return NextResponse.json(result)
}

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createCheckoutSession } from '@/lib/subscription'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const url = await createCheckoutSession(session.user.id)
    return NextResponse.json({ url })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

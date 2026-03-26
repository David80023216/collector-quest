import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { submitPollVote } from '@/lib/polls'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id
  const { pollId, optionId } = await req.json()
  if (!pollId || !optionId) return NextResponse.json({ error: 'pollId and optionId required' }, { status: 400 })
  const result = await submitPollVote(userId, pollId, optionId)
  return NextResponse.json(result)
}

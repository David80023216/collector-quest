import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { submitTriviaAnswer } from '@/lib/trivia'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id
  const { questionId, answer } = await req.json()
  if (!questionId || !answer) return NextResponse.json({ error: 'questionId and answer required' }, { status: 400 })
  const result = await submitTriviaAnswer(userId, questionId, answer)
  return NextResponse.json(result)
}

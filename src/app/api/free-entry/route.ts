import { NextRequest, NextResponse } from 'next/server'
import { submitFreeEntry } from '@/lib/free-entry'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, email } = body
  if (!name || !email) return NextResponse.json({ error: 'Name and email required' }, { status: 400 })
  const result = await submitFreeEntry(name, email)
  return NextResponse.json(result)
}

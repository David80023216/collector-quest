import { NextResponse } from 'next/server'
import { getPrizePageData } from '@/lib/prizes'

export async function GET() {
  const data = await getPrizePageData()
  return NextResponse.json(data)
}

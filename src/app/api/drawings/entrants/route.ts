import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/drawings/entrants?drawingId=xxx
// Public — shows who has entered and how many tickets they've submitted
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const drawingId = searchParams.get('drawingId')

    if (!drawingId) {
      // Fall back to the first UPCOMING/ACTIVE drawing
      const drawing = await prisma.drawing.findFirst({
        where: { status: { in: ['UPCOMING', 'ACTIVE'] } },
        orderBy: { drawDate: 'asc' },
        select: { id: true },
      })
      if (!drawing) return NextResponse.json({ entrants: [], totalTickets: 0 })
      return getEntrants(drawing.id)
    }

    return getEntrants(drawingId)
  } catch (err) {
    console.error('Entrants error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

async function getEntrants(drawingId: string) {
  const entries = await prisma.drawingEntry.findMany({
    where: { drawingId },
    include: {
      user: { select: { name: true, image: true } },
    },
    orderBy: { ticketsUsed: 'desc' },
  })

  const totalTickets = entries.reduce((sum, e) => sum + e.ticketsUsed, 0)

  const entrants = entries.map((e, i) => ({
    rank: i + 1,
    name: e.user.name ?? 'Anonymous',
    image: e.user.image,
    tickets: e.ticketsUsed,
    pct: totalTickets > 0 ? Math.round((e.ticketsUsed / totalTickets) * 100) : 0,
    enteredAt: e.enteredAt,
  }))

  return NextResponse.json({ entrants, totalTickets, drawingId })
}

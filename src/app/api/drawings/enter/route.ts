import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// POST /api/drawings/enter
// Body: { drawingId: string, tickets: number }
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Sign in to enter the drawing' }, { status: 401 })
    }

    const { drawingId, tickets } = await req.json()

    if (!drawingId || !tickets || typeof tickets !== 'number' || tickets < 1) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const ticketCount = Math.floor(tickets)

    // Fetch drawing + user in parallel
    const [drawing, user] = await Promise.all([
      prisma.drawing.findUnique({ where: { id: drawingId } }),
      prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, entries: true } }),
    ])

    if (!drawing) return NextResponse.json({ error: 'Drawing not found' }, { status: 404 })
    if (!['UPCOMING', 'ACTIVE'].includes(drawing.status)) {
      return NextResponse.json({ error: 'This drawing is no longer open' }, { status: 400 })
    }
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (user.entries < ticketCount) {
      return NextResponse.json({
        error: `Not enough tickets — you have ${user.entries} but tried to use ${ticketCount}`,
      }, { status: 400 })
    }

    // Deduct tickets, upsert DrawingEntry, log ledger — all in one transaction
    const [updatedUser, entry] = await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { entries: { decrement: ticketCount } },
      }),
      prisma.drawingEntry.upsert({
        where: { drawingId_userId: { drawingId, userId: session.user.id } },
        create: { drawingId, userId: session.user.id, ticketsUsed: ticketCount },
        update: { ticketsUsed: { increment: ticketCount } },
      }),
      prisma.userLedger.create({
        data: {
          userId: session.user.id,
          transactionType: 'DRAWING_ENTRY',
          entriesChange: -ticketCount,
          pointsChange: 0,
          description: `Entered drawing: ${drawing.title} (${ticketCount} ticket${ticketCount !== 1 ? 's' : ''})`,
          referenceId: drawingId,
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      ticketsUsed: ticketCount,
      totalEntries: entry.ticketsUsed,
      remainingTickets: updatedUser.entries,
    })
  } catch (err: any) {
    console.error('Drawing entry error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

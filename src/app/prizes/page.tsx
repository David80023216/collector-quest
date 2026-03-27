'use client'
import { useEffect, useState, useCallback } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Button from '@/components/ui/Button'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

// ── Card Flip Component ──────────────────────────────────────────────────────
function FlipCard({ imageUrl, player, year, brand, grade, cardNumber, cardTitle }: {
  imageUrl?: string; player?: string; year?: string; brand?: string
  grade?: string; cardNumber?: string; cardTitle?: string
}) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div
      className="relative cursor-pointer select-none"
      style={{ width: 200, height: 280, perspective: 800 }}
      onClick={() => setFlipped(f => !f)}
      title="Click to flip"
    >
      {/* Glow */}
      <div className="absolute -inset-3 bg-gradient-to-b from-yellow-400/20 to-amber-600/20 rounded-xl blur-md hover:blur-lg transition-all" />

      {/* Flip container */}
      <div
        style={{
          width: '100%', height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s cubic-bezier(0.4,0.2,0.2,1)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* ── FRONT ── */}
        <div
          style={{
            position: 'absolute', width: '100%', height: '100%',
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          }}
          className="rounded-lg overflow-hidden shadow-2xl border-4 border-amber-400/30 bg-slate-900"
        >
          {/* PSA top bar */}
          <div className="absolute top-0 left-0 right-0 h-7 bg-gradient-to-r from-blue-800 to-blue-900 flex items-center justify-center z-10">
            <span className="text-white text-xs font-black tracking-widest">PSA</span>
            <span className="ml-1 bg-amber-400 text-slate-900 text-xs font-black px-1.5 py-0.5 rounded">
              {grade?.replace('PSA ', '') || '10'}
            </span>
          </div>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={cardTitle || 'Prize Card'}
              className="w-full h-full object-cover"
              style={{ paddingTop: 28, paddingBottom: 20 }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ paddingTop: 28 }}>
              <span className="text-5xl">🃏</span>
            </div>
          )}
          {/* PSA bottom bar */}
          <div className="absolute bottom-0 left-0 right-0 h-5 bg-gradient-to-r from-blue-800 to-blue-900" />
          {/* Tap hint */}
          <div className="absolute bottom-5 right-0 left-0 flex justify-center">
            <span className="text-[9px] text-blue-200/50 tracking-widest">TAP TO FLIP</span>
          </div>
        </div>

        {/* ── BACK ── */}
        <div
          style={{
            position: 'absolute', width: '100%', height: '100%',
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
          className="rounded-lg overflow-hidden shadow-2xl border-4 border-amber-400/30 bg-gradient-to-b from-blue-900 to-slate-900 flex flex-col"
        >
          {/* PSA top bar */}
          <div className="h-7 bg-gradient-to-r from-blue-800 to-blue-900 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-black tracking-widest">PSA</span>
          </div>
          {/* Card details */}
          <div className="flex-1 flex flex-col items-center justify-center p-3 gap-2">
            <div className="w-12 h-12 rounded-full bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-400/30">
              <span className="text-slate-900 font-black text-lg">{grade?.replace('PSA ', '') || '10'}</span>
            </div>
            <p className="text-amber-400 font-black text-xs tracking-widest text-center">GEM MINT</p>
            <div className="w-full h-px bg-blue-700/50 my-1" />
            <p className="text-white font-bold text-xs text-center leading-tight">{player}</p>
            <p className="text-blue-300 text-[10px] text-center">{year} {brand}</p>
            {cardNumber && <p className="text-blue-300 text-[10px]">Card {cardNumber}</p>}
            <div className="w-full h-px bg-blue-700/50 my-1" />
            <p className="text-[9px] text-blue-400 text-center leading-tight">
              This card has been authenticated<br/>and graded by PSA
            </p>
          </div>
          {/* PSA bottom bar */}
          <div className="h-5 bg-gradient-to-r from-blue-800 to-blue-900 flex-shrink-0" />
        </div>
      </div>
    </div>
  )
}

// ── Drawing Selector Card (clickable to switch featured drawing) ──────────────
function DrawingCard({ drawing, onSelect, isSelected }: { drawing: any; onSelect: () => void; isSelected: boolean }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`cursor-pointer rounded-xl border transition-all overflow-hidden ${
        isSelected
          ? 'border-amber-500/60 bg-gradient-to-br from-amber-500/5 to-slate-800 shadow-lg shadow-amber-500/10'
          : 'border-slate-700 bg-slate-800/60 hover:border-amber-500/30 hover:bg-slate-800'
      }`}
    >
      {/* Card image banner */}
      <div className="relative h-32 bg-gradient-to-b from-slate-700 to-slate-800 overflow-hidden">
        {drawing.cardImageUrl ? (
          <img
            src={drawing.cardImageUrl}
            alt={drawing.cardTitle || drawing.cardPlayer}
            className="w-full h-full object-cover transition-transform duration-500"
            style={{ transform: hovered ? 'scale(1.08)' : 'scale(1)' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">🃏</span>
          </div>
        )}
        {/* PSA grade badge */}
        {drawing.cardGrade && (
          <div className="absolute top-2 right-2 bg-blue-800/90 border border-blue-600/60 rounded px-1.5 py-0.5 flex items-center gap-1">
            <span className="text-white text-[9px] font-black tracking-widest">PSA</span>
            <span className="bg-amber-400 text-slate-900 text-[9px] font-black px-1 rounded">
              {drawing.cardGrade.replace('PSA ', '')}
            </span>
          </div>
        )}
        {isSelected && (
          <div className="absolute inset-0 bg-amber-500/10 flex items-end justify-center pb-1">
            <span className="text-[10px] text-amber-400 font-semibold bg-slate-900/70 px-2 py-0.5 rounded-full">
              ✓ Selected
            </span>
          </div>
        )}
      </div>

      {/* Card details */}
      <div className="p-3">
        <p className={`text-xs font-bold mb-0.5 truncate ${isSelected ? 'text-amber-400' : 'text-slate-200'}`}>
          {drawing.cardPlayer || drawing.title}
        </p>
        <p className="text-[11px] text-slate-400 truncate">{drawing.cardYear} {drawing.cardBrand}</p>
        {drawing.drawDate && (
          <p className="text-[11px] text-slate-500 mt-1">
            🗓️ {new Date(drawing.drawDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        )}
        <p className="text-[10px] text-amber-500/70 mt-1.5 font-medium">
          {isSelected ? 'Viewing ↑' : 'Click to view →'}
        </p>
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function PrizesPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedIdx, setSelectedIdx] = useState(0)

  // Entry state
  const [ticketInput, setTicketInput] = useState(1)
  const [entering, setEntering] = useState(false)
  const [entryResult, setEntryResult] = useState<{ success: boolean; message: string; remainingTickets?: number; totalEntries?: number } | null>(null)
  const [userTickets, setUserTickets] = useState<number | null>(null)

  // Entrants state
  const [entrants, setEntrants] = useState<any[]>([])
  const [totalTickets, setTotalTickets] = useState(0)
  const [entrantsLoading, setEntrantsLoading] = useState(false)

  // Free entry state
  const [freeForm, setFreeForm] = useState({ name: '', email: '' })
  const [freeSubmitting, setFreeSubmitting] = useState(false)
  const [freeResult, setFreeResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    fetch('/api/prizes').then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [])

  useEffect(() => {
    if (session?.user) {
      fetch('/api/user').then(r => r.json()).then(d => setUserTickets(d.entries ?? 0))
    }
  }, [session])

  const loadEntrants = useCallback((drawingId?: string) => {
    setEntrantsLoading(true)
    const url = drawingId ? `/api/drawings/entrants?drawingId=${drawingId}` : '/api/drawings/entrants'
    fetch(url)
      .then(r => r.json())
      .then(d => {
        setEntrants(d.entrants ?? [])
        setTotalTickets(d.totalTickets ?? 0)
      })
      .finally(() => setEntrantsLoading(false))
  }, [])

  useEffect(() => {
    if (data?.upcomingDrawings?.length > 0) {
      loadEntrants(data.upcomingDrawings[selectedIdx]?.id)
      setEntryResult(null)
    }
  }, [data, selectedIdx, loadEntrants])

  async function enterDrawing(drawingId: string) {
    if (!ticketInput || ticketInput < 1) return
    setEntering(true)
    setEntryResult(null)
    const res = await fetch('/api/drawings/enter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drawingId, tickets: ticketInput }),
    })
    const d = await res.json()
    if (d.success) {
      setUserTickets(d.remainingTickets)
      setEntryResult({
        success: true,
        message: `🎟️ You're in! ${ticketInput} ticket${ticketInput !== 1 ? 's' : ''} entered. You now have ${d.totalEntries} total.`,
        remainingTickets: d.remainingTickets,
        totalEntries: d.totalEntries,
      })
      loadEntrants(drawingId)
    } else {
      setEntryResult({ success: false, message: d.error ?? 'Failed to enter' })
    }
    setEntering(false)
  }

  async function submitFreeEntry(e: React.FormEvent) {
    e.preventDefault()
    setFreeSubmitting(true)
    const res = await fetch('/api/free-entry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(freeForm),
    })
    const d = await res.json()
    setFreeSubmitting(false)
    setFreeResult(d.success
      ? { success: true, message: 'Entry submitted! Good luck! 🍀' }
      : { success: false, message: d.error ?? 'Submission failed' }
    )
  }

  if (loading) return <AppLayout><div className="text-center py-12 text-slate-400">Loading...</div></AppLayout>

  const { grandPrize, prizes, recentWinners, upcomingDrawings } = data ?? {}
  const featured = upcomingDrawings?.[selectedIdx] ?? upcomingDrawings?.[0]
  const otherDrawings = (upcomingDrawings ?? []).filter((_: any, i: number) => i !== selectedIdx)
  const myEntry = entrants.find((e: any) => e.name === session?.user?.name)

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Prizes 🏆</h1>
          <p className="text-slate-400 text-sm mt-1">Win real graded sports cards — no purchase necessary</p>
        </div>

        {/* ── FEATURED CARD SHOWCASE ── */}
        {featured && (
          <div className="relative overflow-hidden rounded-2xl border border-amber-500/40 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-yellow-600/10 pointer-events-none" />
            <div className="relative flex flex-col md:flex-row gap-0">
              {/* Card Image with Flip */}
              <div className="md:w-72 flex-shrink-0 flex items-center justify-center p-8 bg-gradient-to-b from-slate-800/60 to-slate-900/60 md:border-r border-slate-700/50">
                <FlipCard
                  imageUrl={featured.cardImageUrl}
                  player={featured.cardPlayer}
                  year={featured.cardYear}
                  brand={featured.cardBrand}
                  grade={featured.cardGrade}
                  cardNumber={featured.cardNumber}
                  cardTitle={featured.cardTitle}
                />
              </div>

              {/* Card Details + Entry */}
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          🎯 {featured.title?.toUpperCase()}
                        </span>
                        {featured.status === 'UPCOMING' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Drawing Open</span>
                        )}
                      </div>
                      <h2 className="text-xl font-black text-slate-100 mt-2 leading-tight">{featured.cardPlayer || featured.title}</h2>
                      {featured.cardTitle && <p className="text-sm text-slate-400 mt-0.5">{featured.cardTitle}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    {featured.cardYear && (
                      <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50">
                        <p className="text-xs text-slate-500 mb-0.5">Year</p>
                        <p className="text-sm font-bold text-slate-100">{featured.cardYear}</p>
                      </div>
                    )}
                    {featured.cardBrand && (
                      <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50">
                        <p className="text-xs text-slate-500 mb-0.5">Brand</p>
                        <p className="text-sm font-bold text-slate-100">{featured.cardBrand}</p>
                      </div>
                    )}
                    {featured.cardGrade && (
                      <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50">
                        <p className="text-xs text-slate-500 mb-0.5">Grade</p>
                        <p className="text-sm font-bold text-amber-400">{featured.cardGrade}</p>
                      </div>
                    )}
                    {featured.cardNumber && (
                      <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50">
                        <p className="text-xs text-slate-500 mb-0.5">Card #</p>
                        <p className="text-sm font-bold text-slate-100">{featured.cardNumber}</p>
                      </div>
                    )}
                  </div>

                  {featured.drawDate && (
                    <p className="text-sm text-slate-400 mb-5">
                      🗓️ Drawing on{' '}
                      <span className="text-slate-200 font-medium">
                        {new Date(featured.drawDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    </p>
                  )}
                </div>

                {/* ── ENTRY SECTION ── */}
                {session ? (
                  <div className="bg-slate-800/80 rounded-xl border border-slate-600/60 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-200">🎟️ Enter This Drawing</p>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Your tickets</p>
                        <p className="text-lg font-black text-amber-400">{userTickets ?? '...'}</p>
                      </div>
                    </div>

                    {myEntry && (
                      <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">
                        <span className="text-emerald-400 text-sm">✅ Already entered</span>
                        <span className="text-slate-400 text-sm">· {myEntry.tickets} ticket{myEntry.tickets !== 1 ? 's' : ''} ({myEntry.pct}% chance)</span>
                      </div>
                    )}

                    {entryResult && (
                      <div className={`rounded-lg px-3 py-2 text-sm ${entryResult.success ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
                        {entryResult.message}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <button
                          onClick={() => setTicketInput(t => Math.max(1, t - 1))}
                          className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold flex items-center justify-center"
                        >−</button>
                        <input
                          type="number"
                          min={1}
                          max={userTickets ?? 999}
                          value={ticketInput}
                          onChange={e => setTicketInput(Math.max(1, Math.min(userTickets ?? 999, parseInt(e.target.value) || 1)))}
                          className="w-16 text-center bg-slate-700 border border-slate-600 rounded-lg px-2 py-1.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        />
                        <button
                          onClick={() => setTicketInput(t => Math.min(userTickets ?? 999, t + 1))}
                          className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold flex items-center justify-center"
                        >+</button>
                        {userTickets !== null && userTickets > 0 && (
                          <button
                            onClick={() => setTicketInput(userTickets)}
                            className="text-xs text-amber-400 hover:text-amber-300 underline underline-offset-2"
                          >All in</button>
                        )}
                      </div>
                      <Button
                        onClick={() => featured && enterDrawing(featured.id)}
                        loading={entering}
                        disabled={!userTickets || userTickets < 1}
                        className="flex-shrink-0"
                      >
                        Enter {ticketInput} 🎟️
                      </Button>
                    </div>

                    {(!userTickets || userTickets === 0) && (
                      <p className="text-xs text-slate-500">
                        No tickets? <Link href="/missions" className="text-amber-400 hover:text-amber-300 underline">Complete missions</Link> to earn entries.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-800/80 rounded-xl border border-slate-600/60 p-4 space-y-3">
                    <p className="text-sm font-semibold text-slate-200 mb-2">🎟️ Enter This Drawing</p>
                    <div className="flex gap-2">
                      <Link href="/login" className="flex-1">
                        <Button className="w-full">Log In to Enter</Button>
                      </Link>
                      <Link href="/register" className="flex-1">
                        <Button variant="outline" className="w-full">Sign Up Free</Button>
                      </Link>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs text-slate-500 mb-2">Or enter without an account:</p>
                      <form onSubmit={submitFreeEntry} className="space-y-2">
                        <input
                          type="text"
                          placeholder="Your name"
                          value={freeForm.name}
                          onChange={e => setFreeForm(f => ({ ...f, name: e.target.value }))}
                          required
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        />
                        <input
                          type="email"
                          placeholder="Email address"
                          value={freeForm.email}
                          onChange={e => setFreeForm(f => ({ ...f, email: e.target.value }))}
                          required
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        />
                        {freeResult && (
                          <p className={`text-xs ${freeResult.success ? 'text-emerald-400' : 'text-red-400'}`}>{freeResult.message}</p>
                        )}
                        <Button type="submit" loading={freeSubmitting} className="w-full">Submit Free Entry</Button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── OTHER DRAWINGS ── */}
        {(upcomingDrawings?.length ?? 0) > 1 && (
          <div>
            <h2 className="text-base font-semibold text-slate-300 mb-3">🗓️ All Active Drawings</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(upcomingDrawings ?? []).map((d: any, i: number) => (
                <DrawingCard
                  key={d.id}
                  drawing={d}
                  isSelected={i === selectedIdx}
                  onSelect={() => { setSelectedIdx(i); setEntryResult(null) }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── ENTRANT LEADERBOARD ── */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
            <div>
              <h2 className="text-base font-semibold text-slate-100">🏅 Current Entrants</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {entrants.length} entrant{entrants.length !== 1 ? 's' : ''} · {totalTickets.toLocaleString()} tickets total
              </p>
            </div>
            <button
              onClick={() => loadEntrants(featured?.id)}
              disabled={entrantsLoading}
              className="text-xs text-amber-400 hover:text-amber-300 disabled:opacity-50 transition-colors"
            >
              {entrantsLoading ? '↻ Refreshing…' : '↻ Refresh'}
            </button>
          </div>

          {entrantsLoading && entrants.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">Loading entrants…</div>
          ) : entrants.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">
              No entries yet — be the first! 🎯
            </div>
          ) : (
            <div className="divide-y divide-slate-700/60">
              {entrants.map((e: any, idx: number) => {
                const isMe = e.name === session?.user?.name
                const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null
                const pct = totalTickets > 0 ? ((e.tickets / totalTickets) * 100) : 0

                return (
                  <div key={e.userId} className={`flex items-center gap-4 px-5 py-3 ${isMe ? 'bg-amber-500/5 border-l-2 border-amber-500' : ''}`}>
                    <span className="w-6 text-center text-sm font-bold text-slate-500">
                      {medal ?? `#${idx + 1}`}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-medium truncate ${isMe ? 'text-amber-300' : 'text-slate-200'}`}>
                          {e.name}{isMe ? ' (you)' : ''}
                        </span>
                        <span className="text-xs text-slate-500 flex-shrink-0">{e.tickets} ticket{e.tickets !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all"
                          style={{ width: `${Math.max(pct, 1)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 flex-shrink-0 w-12 text-right">{pct.toFixed(1)}%</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── RECENT WINNERS ── */}
        {recentWinners?.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-slate-300 mb-3">🎉 Recent Winners</h2>
            <div className="space-y-2">
              {recentWinners.slice(0, 5).map((w: any) => (
                <div key={w.id} className="bg-slate-800 rounded-xl border border-slate-700 px-4 py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-200">{w.displayName}</p>
                    <p className="text-xs text-slate-500">{w.prizeDescription} · {w.drawingTitle}</p>
                  </div>
                  <p className="text-xs text-slate-500 flex-shrink-0">
                    {new Date(w.wonAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

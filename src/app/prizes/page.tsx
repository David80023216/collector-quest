'use client'
import { useEffect, useState, useCallback } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Button from '@/components/ui/Button'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function PrizesPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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

  // Load user ticket balance
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
    if (data) {
      const drawingId = data.upcomingDrawings?.[0]?.id
      loadEntrants(drawingId)
    }
  }, [data, loadEntrants])

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
        message: `🎟️ You're in! ${ticketInput} ticket${ticketInput !== 1 ? 's' : ''} entered. You now have ${d.totalEntries} total ticket${d.totalEntries !== 1 ? 's' : ''} in this drawing.`,
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
  const featured = upcomingDrawings?.[0]
  const myEntry = entrants.find((e: any) => e.name === session?.user?.name)

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Prizes 🏆</h1>
          <p className="text-slate-400 text-sm mt-1">Win real graded sports cards — no purchase necessary</p>
        </div>

        {/* ── FEATURED CARD SHOWCASE ── */}
        {featured && (featured.cardImageUrl || featured.cardPlayer) && (
          <div className="relative overflow-hidden rounded-2xl border border-amber-500/40 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-yellow-600/10 pointer-events-none" />
            <div className="relative flex flex-col md:flex-row gap-0">
              {/* Card Image */}
              <div className="md:w-72 flex-shrink-0 flex items-center justify-center p-8 bg-gradient-to-b from-slate-800/60 to-slate-900/60 md:border-r border-slate-700/50">
                {featured.cardImageUrl ? (
                  <div className="relative group">
                    <div className="absolute -inset-3 bg-gradient-to-b from-yellow-400/20 to-amber-600/20 rounded-xl blur-md group-hover:blur-lg transition-all" />
                    <div className="relative rounded-lg overflow-hidden shadow-2xl border-4 border-amber-400/30 bg-slate-900"
                         style={{ width: 200, height: 280 }}>
                      <div className="absolute top-0 left-0 right-0 h-7 bg-gradient-to-r from-blue-800 to-blue-900 flex items-center justify-center z-10">
                        <span className="text-white text-xs font-black tracking-widest">PSA</span>
                        <span className="ml-1 bg-amber-400 text-slate-900 text-xs font-black px-1.5 py-0.5 rounded">{featured.cardGrade?.replace('PSA ', '') || '10'}</span>
                      </div>
                      <img src={featured.cardImageUrl} alt={featured.cardTitle || 'Prize Card'}
                           className="w-full h-full object-cover" style={{ paddingTop: 28 }} />
                      <div className="absolute bottom-0 left-0 right-0 h-5 bg-gradient-to-r from-blue-800 to-blue-900" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent rounded-lg pointer-events-none" />
                  </div>
                ) : (
                  <div className="w-48 h-64 rounded-lg bg-gradient-to-b from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center">
                    <span className="text-5xl">🃏</span>
                  </div>
                )}
              </div>

              {/* Card Details + Entry */}
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          🎯 THIS MONTH'S PRIZE
                        </span>
                        {featured.status === 'UPCOMING' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Drawing Open</span>
                        )}
                      </div>
                      <h2 className="text-xl font-black text-slate-100 mt-2 leading-tight">{featured.cardPlayer || featured.title}</h2>
                      {featured.cardTitle && <p className="text-sm text-slate-400 mt-0.5">{featured.cardTitle}</p>}
                    </div>
                    {featured.prizeValue > 0 && (
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-slate-500">Est. Value</p>
                        <p className="text-2xl font-black text-amber-400">${featured.prizeValue.toLocaleString()}</p>
                      </div>
                    )}
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
                        onClick={() => enterDrawing(featured.id)}
                        loading={entering}
                        disabled={entering || !userTickets || userTickets < 1}
                        variant="primary"
                        className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold whitespace-nowrap"
                      >
                        Enter {ticketInput > 1 ? `${ticketInput} Tickets` : 'Drawing'}
                      </Button>
                    </div>

                    {userTickets === 0 && (
                      <p className="text-xs text-slate-400">
                        No tickets yet —{' '}
                        <Link href="/dashboard" className="text-amber-400 hover:text-amber-300 underline underline-offset-2">
                          earn some on the dashboard
                        </Link>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    <Link href="/auth/signup">
                      <Button variant="primary" className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold">
                        🚀 Sign Up to Enter
                      </Button>
                    </Link>
                    <a href="#free-entry">
                      <Button variant="outline" className="border-slate-600 text-slate-300 hover:border-slate-500">
                        Free Entry ↓
                      </Button>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── ENTRANT LEADERBOARD ── */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
            <div>
              <h2 className="font-semibold text-slate-100">Current Entrants</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {totalTickets} total ticket{totalTickets !== 1 ? 's' : ''} entered · {entrants.length} entrant{entrants.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => loadEntrants(featured?.id)}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1"
            >
              {entrantsLoading ? '⏳' : '🔄'} Refresh
            </button>
          </div>

          {entrantsLoading ? (
            <div className="py-8 text-center text-slate-500 text-sm">Loading entrants...</div>
          ) : entrants.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-3xl mb-2">🎟️</p>
              <p className="text-slate-400 text-sm">No entries yet — be the first!</p>
              {!session && (
                <Link href="/auth/signup" className="text-amber-400 text-sm hover:text-amber-300 mt-1 block underline underline-offset-2">
                  Sign up to enter
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-700/60">
              {entrants.map((e: any) => {
                const isMe = session?.user?.name === e.name
                return (
                  <div key={e.name + e.rank} className={`flex items-center gap-4 px-5 py-3 ${isMe ? 'bg-amber-500/5' : ''}`}>
                    {/* Rank */}
                    <span className={`w-7 text-center text-sm font-bold ${e.rank === 1 ? 'text-amber-400' : e.rank === 2 ? 'text-slate-300' : e.rank === 3 ? 'text-amber-600' : 'text-slate-500'}`}>
                      {e.rank === 1 ? '🥇' : e.rank === 2 ? '🥈' : e.rank === 3 ? '🥉' : `#${e.rank}`}
                    </span>

                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {e.image ? (
                        <img src={e.image} alt={e.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-white">{e.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isMe ? 'text-amber-400' : 'text-slate-100'}`}>
                        {e.name} {isMe && <span className="text-xs">(you)</span>}
                      </p>
                    </div>

                    {/* Odds bar */}
                    <div className="hidden sm:flex items-center gap-2 w-32">
                      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isMe ? 'bg-amber-400' : 'bg-slate-500'}`}
                          style={{ width: `${Math.max(e.pct, 2)}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 w-8 text-right">{e.pct}%</span>
                    </div>

                    {/* Tickets */}
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-bold ${isMe ? 'text-amber-400' : 'text-slate-200'}`}>
                        {e.tickets.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">ticket{e.tickets !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── GRAND PRIZE TIER ── */}
        {grandPrize && (
          <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-2xl border border-amber-500/40 p-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs text-amber-400/70 mb-1">Current Prize Tier</p>
                <p className="text-3xl font-black text-amber-400">
                  ${grandPrize.currentTier.prizeValue > 0 ? grandPrize.currentTier.prizeValue.toLocaleString() : '???'}
                </p>
                <p className="text-slate-400 text-sm mt-0.5">{grandPrize.currentTier.label}</p>
              </div>
              {grandPrize.nextTier && (
                <div className="text-right">
                  <p className="text-xs text-slate-500">Next tier unlocks at</p>
                  <p className="text-lg font-bold text-slate-300">${grandPrize.nextTier.prizeValue.toLocaleString()}</p>
                  <p className="text-xs text-slate-400 mt-0.5">🚀 {grandPrize.nextTier.subscribersNeeded} more PRO members needed</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── RECENT WINNERS ── */}
        {recentWinners?.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-200 mb-3">Recent Winners 🎉</h2>
            <div className="bg-slate-800 rounded-xl border border-slate-700 divide-y divide-slate-700">
              {recentWinners.map((w: any) => (
                <div key={w.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="font-medium text-sm text-slate-100">{w.displayName}</p>
                    <p className="text-xs text-slate-400">{w.drawingTitle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-amber-400 font-medium">{w.prizeDescription}</p>
                    <p className="text-xs text-slate-500">{new Date(w.wonAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── FREE ENTRY ── */}
        <div id="free-entry" className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-1">Free Entry (No Purchase Necessary)</h2>
          <p className="text-sm text-slate-400 mb-4">
            Enter the drawing for free by mail or using this form. One entry per person per day.
          </p>
          {freeResult ? (
            <div className={`rounded-lg px-4 py-3 text-sm ${freeResult.success ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
              {freeResult.message}
            </div>
          ) : (
            <form onSubmit={submitFreeEntry} className="space-y-3">
              <input
                type="text"
                placeholder="Your name"
                value={freeForm.name}
                onChange={e => setFreeForm(p => ({ ...p, name: e.target.value }))}
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              <input
                type="email"
                placeholder="your@email.com"
                value={freeForm.email}
                onChange={e => setFreeForm(p => ({ ...p, email: e.target.value }))}
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              <Button type="submit" loading={freeSubmitting} variant="outline" className="w-full">
                Submit Free Entry 🎟️
              </Button>
            </form>
          )}
        </div>
      </div>
    </AppLayout>
  )
}

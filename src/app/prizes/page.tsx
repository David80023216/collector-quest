'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Button from '@/components/ui/Button'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function PrizesPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [freeForm, setFreeForm] = useState({ name: '', email: '' })
  const [freeSubmitting, setFreeSubmitting] = useState(false)
  const [freeResult, setFreeResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    fetch('/api/prizes').then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [])

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
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-yellow-600/10 pointer-events-none" />

            <div className="relative flex flex-col md:flex-row gap-0">
              {/* Card Image Panel */}
              <div className="md:w-72 flex-shrink-0 flex items-center justify-center p-8 bg-gradient-to-b from-slate-800/60 to-slate-900/60 md:border-r border-slate-700/50">
                {featured.cardImageUrl ? (
                  <div className="relative group">
                    {/* PSA slab effect */}
                    <div className="absolute -inset-3 bg-gradient-to-b from-yellow-400/20 to-amber-600/20 rounded-xl blur-md group-hover:blur-lg transition-all" />
                    <div className="relative rounded-lg overflow-hidden shadow-2xl border-4 border-amber-400/30 bg-slate-900"
                         style={{ width: 200, height: 280 }}>
                      {/* PSA label bar */}
                      <div className="absolute top-0 left-0 right-0 h-7 bg-gradient-to-r from-blue-800 to-blue-900 flex items-center justify-center z-10">
                        <span className="text-white text-xs font-black tracking-widest">PSA</span>
                        <span className="ml-1 bg-amber-400 text-slate-900 text-xs font-black px-1.5 py-0.5 rounded">{featured.cardGrade?.replace('PSA ', '') || '10'}</span>
                      </div>
                      <img
                        src={featured.cardImageUrl}
                        alt={featured.cardTitle || 'Prize Card'}
                        className="w-full h-full object-cover"
                        style={{ paddingTop: 28 }}
                      />
                      {/* Bottom bar */}
                      <div className="absolute bottom-0 left-0 right-0 h-5 bg-gradient-to-r from-blue-800 to-blue-900" />
                    </div>
                    {/* Shine overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent rounded-lg pointer-events-none" />
                  </div>
                ) : (
                  <div className="w-48 h-64 rounded-lg bg-gradient-to-b from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center">
                    <span className="text-5xl">🃏</span>
                  </div>
                )}
              </div>

              {/* Card Details Panel */}
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          🎯 THIS MONTH'S PRIZE
                        </span>
                        {featured.status === 'UPCOMING' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Drawing Open
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl font-black text-slate-100 mt-2 leading-tight">
                        {featured.cardPlayer || featured.title}
                      </h2>
                      {featured.cardTitle && (
                        <p className="text-sm text-slate-400 mt-0.5">{featured.cardTitle}</p>
                      )}
                    </div>
                    {featured.prizeValue > 0 && (
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-slate-500">Est. Value</p>
                        <p className="text-2xl font-black text-amber-400">${featured.prizeValue.toLocaleString()}</p>
                      </div>
                    )}
                  </div>

                  {/* Card Details Grid */}
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
                        {new Date(featured.drawDate).toLocaleDateString('en-US', {
                          month: 'long', day: 'numeric', year: 'numeric'
                        })}
                      </span>
                    </p>
                  )}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-3">
                  {session ? (
                    <Link href="/dashboard">
                      <Button variant="primary" className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold">
                        🎟️ Earn More Entries
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/auth/signup">
                      <Button variant="primary" className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold">
                        🚀 Sign Up to Enter
                      </Button>
                    </Link>
                  )}
                  <a href="#free-entry">
                    <Button variant="outline" className="border-slate-600 text-slate-300 hover:border-slate-500">
                      Free Entry ↓
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

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
                  <p className="text-xs text-slate-400 mt-0.5">
                    🚀 {grandPrize.nextTier.subscribersNeeded} more PRO members needed
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── OTHER UPCOMING DRAWINGS ── */}
        {upcomingDrawings?.length > 1 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-200 mb-3">More Drawings</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {upcomingDrawings.slice(1).map((d: any) => (
                <div key={d.id} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-100">{d.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${d.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                      {d.status}
                    </span>
                  </div>
                  {d.description && <p className="text-sm text-slate-400 mb-3">{d.description}</p>}
                  <p className="text-amber-400 font-bold">🏆 {d.prizeDescription}</p>
                  {d.drawDate && (
                    <p className="text-xs text-slate-500 mt-2">
                      Drawing: {new Date(d.drawDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PRIZE CATALOG ── */}
        {prizes?.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-200 mb-3">Prize Catalog</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {prizes.map((p: any) => (
                <div key={p.id} className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                  <div className="text-3xl mb-2">🎁</div>
                  <h3 className="font-medium text-slate-100 mb-1">{p.title}</h3>
                  {p.description && <p className="text-xs text-slate-400 mb-2">{p.description}</p>}
                  <p className="text-amber-400 text-sm font-bold">{p.value}</p>
                </div>
              ))}
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

'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Button from '@/components/ui/Button'
import { useSession } from 'next-auth/react'

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

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Prizes 🏆</h1>
          <p className="text-slate-400 text-sm mt-1">Current prize pool and upcoming drawings</p>
        </div>

        {/* Grand Prize */}
        {grandPrize && (
          <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-2xl border border-amber-500/40 p-6 text-center">
            <p className="text-sm text-amber-400/70 mb-2">Current Grand Prize</p>
            <p className="text-5xl font-black text-amber-400 mb-2">
              ${grandPrize.currentTier.prizeValue > 0 ? grandPrize.currentTier.prizeValue.toLocaleString() : '???'}
            </p>
            <p className="text-slate-300 text-sm">{grandPrize.currentTier.label}</p>
            {grandPrize.nextTier && (
              <p className="text-xs text-slate-400 mt-3">
                🚀 {grandPrize.nextTier.subscribersNeeded} more PRO members unlocks ${grandPrize.nextTier.prizeValue.toLocaleString()}
              </p>
            )}
          </div>
        )}

        {/* Upcoming Drawings */}
        {upcomingDrawings?.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-200 mb-3">Upcoming Drawings</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {upcomingDrawings.map((d: any) => (
                <div key={d.id} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-100">{d.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${d.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                      {d.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">{d.description}</p>
                  <p className="text-amber-400 font-bold">🏆 {d.prizeDescription}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    Drawing: {new Date(d.drawDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Prizes */}
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

        {/* Recent Winners */}
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

        {/* Free Entry */}
        <div id="free-entry" className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-2">Free Entry (No Purchase Necessary)</h2>
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
                Submit Free Entry
              </Button>
            </form>
          )}
        </div>
      </div>
    </AppLayout>
  )
}

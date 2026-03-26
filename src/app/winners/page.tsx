import { getPrizePageData } from '@/lib/prizes'
import Link from 'next/link'

export default async function WinnersPage() {
  let winners: any[] = []
  try {
    const data = await getPrizePageData()
    winners = data.recentWinners
  } catch {}

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <nav className="border-b border-slate-700/50 bg-slate-900/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-amber-400">
            <span>🏆</span> Collector Quest
          </Link>
          <Link href="/login" className="text-sm text-slate-400 hover:text-slate-100">Sign in →</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Past Winners 🎉</h1>
        <p className="text-slate-400 mb-8">Real collectors winning real prizes</p>

        {winners.length === 0 ? (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
            <div className="text-5xl mb-4">🔜</div>
            <p className="text-slate-400">No winners yet — the first drawing is coming soon!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {winners.map(w => (
              <div key={w.id} className="bg-slate-800 rounded-xl border border-slate-700 p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-100">{w.displayName}</p>
                  <p className="text-sm text-slate-400">{w.drawingTitle}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-amber-400">{w.prizeDescription}</p>
                  <p className="text-xs text-slate-500">{new Date(w.wonAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

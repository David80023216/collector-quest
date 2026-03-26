import Link from 'next/link'
import Button from '@/components/ui/Button'

const freeFeatures = ['Daily reward claim','5 daily missions','1 weekly mission','Trivia & polls','Reward packs','Community participation','Leaderboard access']
const proFeatures = ['Everything in Free','Unlimited daily missions','All weekly missions','PRO-exclusive packs','PRO store items','Higher reward multipliers','Contributes to grand prize pool','Priority support']

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <nav className="border-b border-slate-700/50 bg-slate-900/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-amber-400">
            <span>🏆</span> Collector Quest
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-400 hover:text-slate-100">Sign in</Link>
            <Link href="/signup"><Button size="sm">Get Started</Button></Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple, transparent pricing</h1>
          <p className="text-slate-400 text-lg">Start free. Upgrade to unlock more rewards and grow the prize pool.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-8">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 flex flex-col">
            <h2 className="text-xl font-bold mb-1">Free</h2>
            <div className="text-5xl font-black mb-1">$0</div>
            <p className="text-slate-400 text-sm mb-8">Forever free, no card required</p>
            <ul className="space-y-3 mb-8 flex-1">
              {freeFeatures.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                  <span className="text-emerald-400 flex-shrink-0">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/signup"><Button variant="outline" className="w-full">Get Started Free</Button></Link>
          </div>

          <div className="bg-gradient-to-br from-amber-500/15 to-amber-600/5 rounded-2xl border border-amber-500/40 p-8 flex flex-col relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-amber-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full">BEST VALUE</div>
            <h2 className="text-xl font-bold mb-1">PRO</h2>
            <div className="text-5xl font-black text-amber-400 mb-1">$9.99<span className="text-xl font-normal text-slate-400">/mo</span></div>
            <p className="text-slate-400 text-sm mb-8">Cancel anytime</p>
            <ul className="space-y-3 mb-8 flex-1">
              {proFeatures.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                  <span className="text-amber-400 flex-shrink-0">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/signup"><Button className="w-full">Start PRO →</Button></Link>
          </div>
        </div>

        <div className="mt-12 bg-slate-800 rounded-xl border border-slate-700 p-6 text-center">
          <h3 className="font-semibold text-lg mb-2">No purchase necessary to win</h3>
          <p className="text-slate-400 text-sm">
            Collector Quest offers free alternatives to earn entries. See our{' '}
            <Link href="/prizes#free-entry" className="text-amber-400 hover:text-amber-300">free entry page</Link>{' '}
            for details.
          </p>
        </div>
      </div>
    </div>
  )
}

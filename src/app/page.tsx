import Link from 'next/link'
import Button from '@/components/ui/Button'
import { getPrizeTiers } from '@/lib/prizes'

export default async function HomePage() {
  let tiers: any[] = []
  try { tiers = await getPrizeTiers() } catch {}

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Navbar */}
      <nav className="border-b border-slate-700/50 bg-slate-900/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2 font-bold text-xl text-amber-400">
            <span className="text-2xl">🏆</span>
            Collector Quest
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-400 hover:text-slate-100 transition-colors">Sign in</Link>
            <Link href="/signup">
              <Button size="sm">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-1.5 text-amber-400 text-sm font-medium mb-6">
          🎉 New prizes added every month
        </div>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
          Win Real Prizes<br />
          <span className="text-amber-400">Playing Collector Quests</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
          Complete daily missions, answer trivia, open reward packs, and earn entries into prize drawings — all for free.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup">
            <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-4">
              Start Winning Free 🚀
            </Button>
          </Link>
          <Link href="/prizes">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-4">
              View Current Prizes
            </Button>
          </Link>
        </div>
        <p className="text-sm text-slate-500 mt-4">No purchase necessary. Free to play.</p>
      </section>

      {/* Features */}
      <section className="bg-slate-800/50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Everything a collector needs</h2>
          <p className="text-slate-400 text-center mb-12 max-w-xl mx-auto">
            A complete platform built for sports card collectors who want to earn real rewards
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🎯', title: 'Daily Missions', desc: 'Complete rotating challenges every day to earn entries and points. New missions refresh daily.' },
              { icon: '🎟️', title: 'Entry Drawings', desc: 'Use your entries to enter prize drawings. More entries = more chances to win.' },
              { icon: '📦', title: 'Reward Packs', desc: 'Open mystery packs that contain entries, points, streak boosts, and bonus items.' },
              { icon: '❓', title: 'Sports Trivia', desc: 'Test your sports card knowledge daily to earn bonus entries and points.' },
              { icon: '🗳️', title: 'Community Polls', desc: 'Vote on collector polls and contribute to community milestones for group rewards.' },
              { icon: '📊', title: 'Leaderboards', desc: 'Compete against other collectors for top streaks, missions, and contributions.' },
            ].map(f => (
              <div key={f.title} className="bg-slate-800 rounded-xl border border-slate-700 p-6 hover:border-amber-500/30 transition-colors">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            { step: '1', title: 'Create free account', desc: 'Sign up in seconds. No credit card required. Start earning immediately.' },
            { step: '2', title: 'Complete missions', desc: 'Log in daily, answer trivia, vote on polls, and open packs to earn entries.' },
            { step: '3', title: 'Win prizes', desc: 'Your entries go into drawings. Winners are selected and prizes are shipped.' },
          ].map(s => (
            <div key={s.step} className="text-center">
              <div className="w-14 h-14 bg-amber-500 text-slate-900 rounded-full font-black text-xl flex items-center justify-center mx-auto mb-4">
                {s.step}
              </div>
              <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
              <p className="text-slate-400 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Prize tiers */}
      {tiers.length > 0 && (
        <section className="bg-slate-800/50 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-bold text-center mb-4">Prize Pool Grows With Us</h2>
            <p className="text-slate-400 text-center mb-10">More PRO members = bigger prizes for everyone</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tiers.map((tier: any) => (
                <div key={tier.id} className="bg-slate-800 rounded-xl border border-slate-700 p-5 text-center">
                  <p className="text-sm text-slate-400 mb-1">{tier.minSubscribers}+ Pro Members</p>
                  <p className="text-2xl font-bold text-amber-400">${tier.prizeValue}</p>
                  <p className="text-sm text-slate-300 mt-1">{tier.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">Simple pricing</h2>
        <p className="text-slate-400 text-center mb-12">Start free. Upgrade for more rewards.</p>
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Free */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8">
            <h3 className="text-xl font-bold mb-1">Free</h3>
            <div className="text-4xl font-black text-slate-100 mb-1">$0</div>
            <p className="text-slate-400 text-sm mb-6">Forever free</p>
            <ul className="space-y-3 mb-8">
              {['Daily reward claim','5 daily missions','1 weekly mission','Trivia & polls','Reward packs','Leaderboard access'].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                  <span className="text-emerald-400">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="block">
              <Button variant="outline" className="w-full">Get Started Free</Button>
            </Link>
          </div>
          {/* Pro */}
          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-2xl border border-amber-500/40 p-8 relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-amber-500 text-slate-900 text-xs font-bold px-2 py-1 rounded-full">MOST POPULAR</div>
            <h3 className="text-xl font-bold mb-1">PRO</h3>
            <div className="text-4xl font-black text-amber-400 mb-1">$9.99<span className="text-xl font-normal text-slate-400">/mo</span></div>
            <p className="text-slate-400 text-sm mb-6">Grow the prize pool</p>
            <ul className="space-y-3 mb-8">
              {['Everything in Free','Unlimited daily missions','All weekly missions','PRO-exclusive packs','PRO store items','Higher entry multipliers','Contributes to prize pool'].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                  <span className="text-amber-400">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/signup">
              <Button className="w-full">Upgrade to PRO</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <span>🏆</span> Collector Quest
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-slate-400">
            <Link href="/prizes" className="hover:text-slate-100">Prizes</Link>
            <Link href="/winners" className="hover:text-slate-100">Winners</Link>
            <Link href="/pricing" className="hover:text-slate-100">Pricing</Link>
            <Link href="/prizes#free-entry" className="hover:text-slate-100">Free Entry</Link>
          </div>
          <p className="text-sm text-slate-500">© 2025 Collector Quest. No purchase necessary.</p>
        </div>
      </footer>
    </div>
  )
}

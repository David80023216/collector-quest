'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'

export default function CommunityPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/community').then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) return <AppLayout><div className="text-center py-12 text-slate-400">Loading...</div></AppLayout>

  const { stats, leaderboard } = data ?? {}

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Community 🤝</h1>
          <p className="text-slate-400 text-sm mt-1">Together we unlock rewards for everyone</p>
        </div>

        {stats && (
          <>
            {/* Progress */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
              <h2 className="font-semibold text-slate-100 mb-4">Community Progress</h2>
              <div className="text-center mb-4">
                <p className="text-4xl font-black text-amber-400">{stats.totalContributions.toLocaleString()}</p>
                <p className="text-sm text-slate-400">Total Contributions</p>
              </div>
              {stats.nextMilestone && (
                <>
                  <div className="flex justify-between text-xs text-slate-400 mb-2">
                    <span>Current: {stats.currentMilestone?.title ?? 'Starting Out'}</span>
                    <span>Next: {stats.nextMilestone.title}</span>
                  </div>
                  <div className="bg-slate-700 rounded-full h-3 mb-2">
                    <div className="bg-amber-500 h-3 rounded-full transition-all" style={{ width: `${stats.progressPercent}%` }} />
                  </div>
                  <p className="text-xs text-slate-400 text-right">{stats.progressPercent}%</p>
                  <div className="mt-4 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                    <p className="text-sm text-amber-400 font-medium">{stats.nextMilestone.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{stats.nextMilestone.description}</p>
                    <p className="text-xs text-emerald-400 mt-1">Reward: {stats.nextMilestone.rewardDescription}</p>
                  </div>
                </>
              )}
            </div>

            {/* Milestones */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
              <h2 className="font-semibold text-slate-100 mb-4">Milestones</h2>
              <div className="space-y-3">
                {stats.milestones.map((m: any) => (
                  <div key={m.id} className={`flex items-center gap-3 p-3 rounded-lg border ${m.isUnlocked ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-700'}`}>
                    <span className="text-2xl">{m.isUnlocked ? '✅' : '🔒'}</span>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${m.isUnlocked ? 'text-emerald-400' : 'text-slate-300'}`}>{m.title}</p>
                      <p className="text-xs text-slate-400">{m.threshold.toLocaleString()} contributions</p>
                    </div>
                    <p className="text-xs text-amber-400 text-right max-w-24">{m.rewardDescription}</p>
                  </div>
                ))}
                {stats.milestones.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No milestones yet</p>}
              </div>
            </div>
          </>
        )}

        {/* Top Contributors */}
        {leaderboard?.length > 0 && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <h2 className="font-semibold text-slate-100 mb-4">Top Contributors</h2>
            <div className="space-y-2">
              {leaderboard.map((u: any, i: number) => (
                <div key={u.userId} className="flex items-center gap-3 py-2">
                  <span className="w-6 text-center text-sm font-bold text-slate-500">#{i + 1}</span>
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center">
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="flex-1 text-sm text-slate-300">{u.name}</span>
                  <span className="text-sm font-bold text-amber-400">{u.totalContributions} 🤝</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Button from '@/components/ui/Button'

export default function PollsPage() {
  const [polls, setPolls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/polls').then(r => r.json()).then(d => { setPolls(d.polls ?? []); setLoading(false) })
  }, [])

  async function vote(pollId: string, optionId: string) {
    setVoting(pollId)
    const res = await fetch('/api/polls/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pollId, optionId }),
    })
    const data = await res.json()
    setVoting(null)
    if (data.success) {
      setPolls(prev => prev.map(p => p.id === pollId ? { ...p, ...data.poll, hasVoted: true, votedOptionId: optionId } : p))
    }
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Community Polls 🗳️</h1>
          <p className="text-slate-400 text-sm mt-1">Vote to earn entries and contribute to community milestones</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading polls...</div>
        ) : polls.length === 0 ? (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
            <div className="text-5xl mb-4">🗳️</div>
            <p className="text-slate-400">No active polls right now. Check back soon!</p>
          </div>
        ) : (
          polls.map(poll => (
            <div key={poll.id} className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-slate-100 mb-4">{poll.question}</h2>
              <div className="space-y-3">
                {poll.options?.map((opt: any) => {
                  const totalVotes = poll.options.reduce((sum: number, o: any) => sum + (o.votes ?? 0), 0)
                  const pct = totalVotes > 0 ? Math.round(((opt.votes ?? 0) / totalVotes) * 100) : 0
                  const isVoted = poll.votedOptionId === opt.id

                  return poll.hasVoted ? (
                    <div key={opt.id} className={`rounded-xl p-3 border ${isVoted ? 'border-amber-500/50 bg-amber-500/5' : 'border-slate-700 bg-slate-700/20'}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-slate-200">{opt.text}</span>
                        <span className="text-sm font-bold text-amber-400">{pct}%</span>
                      </div>
                      <div className="bg-slate-700 rounded-full h-1.5">
                        <div className="bg-amber-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{opt.votes ?? 0} votes</p>
                    </div>
                  ) : (
                    <button
                      key={opt.id}
                      onClick={() => vote(poll.id, opt.id)}
                      disabled={voting === poll.id}
                      className="w-full text-left px-4 py-3 rounded-xl border border-slate-700 text-slate-300 text-sm hover:border-amber-500/30 hover:bg-amber-500/5 transition-colors disabled:opacity-50"
                    >
                      {opt.text}
                    </button>
                  )
                })}
              </div>
              {poll.hasVoted && poll.entriesReward > 0 && (
                <p className="text-sm text-amber-400 mt-4">✓ +{poll.entriesReward} entries earned for voting!</p>
              )}
            </div>
          ))
        )}
      </div>
    </AppLayout>
  )
}

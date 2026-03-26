'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { useSession } from 'next-auth/react'

const tabs = [
  { key: 'entries', label: 'Entries 🎟️' },
  { key: 'streak', label: 'Streaks 🔥' },
  { key: 'missions', label: 'Missions 🎯' },
  { key: 'contribution', label: 'Community 🤝' },
]

const rankEmojis = ['🥇', '🥈', '🥉']

export default function LeaderboardsPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('entries')
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function loadLeaderboard(type: string) {
    setLoading(true)
    const res = await fetch(`/api/leaderboards?type=${type}`)
    const json = await res.json()
    setData(json.data ?? [])
    setLoading(false)
  }

  useEffect(() => { loadLeaderboard(activeTab) }, [activeTab])

  function getMainValue(row: any) {
    switch (activeTab) {
      case 'entries': return `${row.entries?.toLocaleString()} 🎟️`
      case 'streak': return `${row.currentStreak}d 🔥`
      case 'missions': return `${row.missionsCompleted} ✅`
      case 'contribution': return `${row.totalContributions} 🤝`
      default: return ''
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Leaderboard 📊</h1>
          <p className="text-slate-400 text-sm mt-1">See how you rank against other collectors</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${activeTab === tab.key ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-100'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading...</div>
          ) : data.length === 0 ? (
            <div className="text-center py-12 text-slate-400">No data yet. Be the first!</div>
          ) : (
            <div>
              {data.map((row, idx) => {
                const isMe = row.userId === session?.user?.id
                return (
                  <div
                    key={row.userId}
                    className={`flex items-center gap-4 px-5 py-3.5 border-b border-slate-700/50 last:border-0
                      ${isMe ? 'bg-amber-500/10 border-l-2 border-l-amber-500' : idx < 3 ? 'bg-slate-700/20' : ''}`}
                  >
                    <div className="w-8 text-center text-lg flex-shrink-0">
                      {idx < 3 ? rankEmojis[idx] : <span className="text-sm text-slate-500">#{row.rank}</span>}
                    </div>
                    <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 font-bold text-sm flex items-center justify-center flex-shrink-0">
                      {row.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm truncate ${isMe ? 'text-amber-400' : 'text-slate-200'}`}>
                        {row.name}{isMe ? ' (You)' : ''}
                      </p>
                    </div>
                    <div className="text-sm font-bold text-slate-100">{getMainValue(row)}</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}

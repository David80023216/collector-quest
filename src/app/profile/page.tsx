'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [badges, setBadges] = useState<any[]>([])
  const [ledger, setLedger] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [activeTab, setActiveTab] = useState('stats')

  useEffect(() => {
    Promise.all([
      fetch('/api/user').then(r => r.json()),
      fetch('/api/user/badges').then(r => r.json()),
      fetch('/api/user/ledger').then(r => r.json()),
    ]).then(([ud, bd, ld]) => {
      setUser(ud.user)
      setEditName(ud.user?.name ?? '')
      setBadges(bd.badges ?? [])
      setLedger(ld.transactions ?? [])
      setLoading(false)
    })
  }, [])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName }),
    })
    const data = await res.json()
    setSaving(false)
    if (data.user) {
      setUser((prev: any) => ({ ...prev, name: data.user.name }))
      setFeedback('Profile updated!')
      setTimeout(() => setFeedback(''), 3000)
    }
  }

  if (loading) return <AppLayout><div className="text-center py-12 text-slate-400">Loading...</div></AppLayout>

  const tabs = ['stats', 'badges', 'history']

  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Profile</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your account and view your history</p>
        </div>

        {/* Profile header */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-amber-500 text-slate-900 font-black text-2xl flex items-center justify-center flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">{user?.name}</h2>
              <p className="text-sm text-slate-400">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={user?.plan === 'PRO' ? 'amber' : 'slate'}>{user?.plan}</Badge>
                <Badge variant="blue">Member since {new Date(user?.createdAt).getFullYear()}</Badge>
              </div>
            </div>
          </div>

          <form onSubmit={saveProfile} className="space-y-3">
            <input
              type="text"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              placeholder="Your name"
            />
            <div className="flex items-center gap-3">
              <Button type="submit" loading={saving} size="sm">Save Changes</Button>
              {feedback && <span className="text-sm text-emerald-400">{feedback}</span>}
            </div>
          </form>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors
                ${activeTab === tab ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-100'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'stats' && (
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Entries', value: user?.entries?.toLocaleString(), icon: '🎟️', color: 'text-amber-400' },
              { label: 'Points', value: user?.points?.toLocaleString(), icon: '⭐', color: 'text-emerald-400' },
              { label: 'Current Streak', value: `${user?.currentStreak}d`, icon: '🔥', color: 'text-orange-400' },
              { label: 'Longest Streak', value: `${user?.longestStreak}d`, icon: '📈', color: 'text-blue-400' },
              { label: 'Missions Done', value: user?._count?.missionCompletions, icon: '🎯', color: 'text-purple-400' },
              { label: 'Packs Opened', value: user?._count?.rewardPackOpens, icon: '📦', color: 'text-pink-400' },
              { label: 'Badges Earned', value: user?._count?.userBadges, icon: '🏅', color: 'text-amber-400' },
              { label: 'Contributions', value: user?.totalContributions, icon: '🤝', color: 'text-emerald-400' },
            ].map(s => (
              <div key={s.label} className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-slate-400">{s.label}</p>
                  <span>{s.icon}</span>
                </div>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            {badges.length === 0 ? (
              <p className="text-center text-slate-400 py-8">No badges yet. Complete missions to earn your first badge!</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {badges.map((ub: any) => (
                  <div key={ub.id} className="bg-slate-700/50 rounded-lg p-3 text-center border border-slate-700">
                    <div className="text-3xl mb-2">{ub.badge.icon}</div>
                    <p className="text-xs font-medium text-slate-200">{ub.badge.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{ub.badge.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 divide-y divide-slate-700">
            {ledger.length === 0 ? (
              <p className="text-center text-slate-400 py-8">No transactions yet</p>
            ) : (
              ledger.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="text-sm text-slate-200 truncate">{tx.description}</p>
                    <p className="text-xs text-slate-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-xs flex gap-3 flex-shrink-0">
                    {tx.entriesChange !== 0 && (
                      <span className={tx.entriesChange > 0 ? 'text-amber-400' : 'text-red-400'}>
                        {tx.entriesChange > 0 ? '+' : ''}{tx.entriesChange} 🎟️
                      </span>
                    )}
                    {tx.pointsChange !== 0 && (
                      <span className={tx.pointsChange > 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {tx.pointsChange > 0 ? '+' : ''}{tx.pointsChange} ⭐
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </AppLayout>
  )
}

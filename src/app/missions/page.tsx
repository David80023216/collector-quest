'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Link from 'next/link'

interface Mission {
  id: string
  title: string
  description: string
  category: string
  difficulty: string
  scope: string
  entriesReward: number
  pointsReward: number
  packReward: boolean
  completed: boolean
}

const difficultyColor: Record<string, 'emerald' | 'amber' | 'red'> = {
  EASY: 'emerald', MEDIUM: 'amber', HARD: 'red'
}

// Category icons and colors
const categoryInfo: Record<string, { icon: string; label: string; color: string }> = {
  LOGIN_CLAIM: { icon: '📅', label: 'Daily Check-In', color: 'text-blue-400' },
  STREAK:      { icon: '🔥', label: 'Streak', color: 'text-orange-400' },
  TRIVIA:      { icon: '🧠', label: 'Trivia', color: 'text-purple-400' },
  SOCIAL:      { icon: '👥', label: 'Social', color: 'text-pink-400' },
  POLL:        { icon: '📊', label: 'Poll', color: 'text-cyan-400' },
  PACK:        { icon: '📦', label: 'Open Pack', color: 'text-amber-400' },
  COLLECTION:  { icon: '🃏', label: 'Collection', color: 'text-emerald-400' },
  COMMUNITY:   { icon: '🤝', label: 'Community', color: 'text-indigo-400' },
}

// Category → link destination for "go do this" prompts
const categoryLink: Record<string, string> = {
  TRIVIA:     '/trivia',
  POLL:       '/community',
  PACK:       '/packs',
  SOCIAL:     '/community',
  COMMUNITY:  '/community',
}

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Record<string, { success: boolean; message: string }>>({})
  const [confirming, setConfirming] = useState<string | null>(null)

  async function loadMissions() {
    const res = await fetch('/api/missions')
    const data = await res.json()
    setMissions(data.missions ?? [])
    setStats(data.stats)
    setLoading(false)
  }

  useEffect(() => { loadMissions() }, [])

  async function completeMission(missionId: string) {
    setCompleting(missionId)
    setConfirming(null)
    const res = await fetch('/api/missions/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ missionId }),
    })
    const data = await res.json()
    setCompleting(null)

    if (data.success) {
      setFeedback(prev => ({ ...prev, [missionId]: { success: true, message: `+${data.entries} entries, +${data.points} pts${data.packAwarded ? ', 📦 pack!' : ''}` } }))
      setMissions(prev => prev.map(m => m.id === missionId ? { ...m, completed: true } : m))
    } else {
      setFeedback(prev => ({ ...prev, [missionId]: { success: false, message: data.error ?? 'Failed' } }))
    }
  }

  function handleComplete(mission: Mission) {
    // Weekly missions require confirmation
    if (mission.scope === 'WEEKLY') {
      setConfirming(mission.id)
    } else {
      completeMission(mission.id)
    }
  }

  const daily = missions.filter(m => m.scope === 'DAILY')
  const weekly = missions.filter(m => m.scope === 'WEEKLY')

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Missions 🎯</h1>
          <p className="text-slate-400 text-sm mt-1">Complete missions to earn entries and points</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Today's Completions", value: stats.todayCompletions },
              { label: 'Total Completed', value: stats.totalCompletions },
              { label: 'Unique Missions', value: stats.uniqueMissionsCompleted },
            ].map(s => (
              <div key={s.label} className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-center">
                <p className="text-2xl font-bold text-amber-400">{s.value}</p>
                <p className="text-xs text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading missions...</div>
        ) : (
          <>
            <MissionSection
              title="📅 Daily Missions"
              subtitle="Reset every day at midnight"
              missions={daily}
              completing={completing}
              confirming={confirming}
              feedback={feedback}
              onComplete={handleComplete}
              onConfirm={completeMission}
              onCancelConfirm={() => setConfirming(null)}
            />
            <MissionSection
              title="📆 Weekly Challenge"
              subtitle="Resets each week — only completable once"
              missions={weekly}
              completing={completing}
              confirming={confirming}
              feedback={feedback}
              onComplete={handleComplete}
              onConfirm={completeMission}
              onCancelConfirm={() => setConfirming(null)}
            />
          </>
        )}

        {/* How to earn more */}
        <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">💡 More Ways to Earn Entries</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { icon: '🧠', label: 'Answer Trivia', href: '/trivia' },
              { icon: '📦', label: 'Open Packs', href: '/packs' },
              { icon: '📊', label: 'Vote in Polls', href: '/community' },
              { icon: '🏆', label: 'Leaderboard', href: '/leaderboard' },
              { icon: '🏪', label: 'Visit Store', href: '/store' },
              { icon: '🎯', label: 'Enter Drawing', href: '/prizes' },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg p-3 transition-colors border border-slate-600/50 hover:border-amber-500/30"
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm text-slate-300">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

function MissionSection({ title, subtitle, missions, completing, confirming, feedback, onComplete, onConfirm, onCancelConfirm }: any) {
  if (missions.length === 0) return null

  return (
    <div>
      <div className="mb-3">
        <h2 className="text-lg font-semibold text-slate-200">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {missions.map((m: Mission) => {
          const catInfo = categoryInfo[m.category] ?? { icon: '🎯', label: m.category, color: 'text-slate-400' }
          const actionLink = categoryLink[m.category]
          const isWeekly = m.scope === 'WEEKLY'
          const isConfirming = confirming === m.id

          return (
            <div
              key={m.id}
              className={`bg-slate-800 rounded-xl border p-5 transition-all ${
                m.completed
                  ? 'border-emerald-500/30 opacity-70'
                  : isWeekly
                    ? 'border-purple-500/30 hover:border-purple-500/60'
                    : 'border-slate-700 hover:border-amber-500/30'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-sm ${catInfo.color}`}>{catInfo.icon}</span>
                    <span className="text-xs text-slate-500">{catInfo.label}</span>
                    {isWeekly && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">Weekly</span>
                    )}
                  </div>
                  <h3 className={`font-medium text-sm ${m.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                    {m.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{m.description}</p>
                </div>
                <Badge variant={difficultyColor[m.difficulty] ?? 'slate'}>{m.difficulty}</Badge>
              </div>

              <div className="flex items-center gap-3 mb-3 text-xs">
                {m.entriesReward > 0 && <span className="text-amber-400">+{m.entriesReward} 🎟️</span>}
                {m.pointsReward > 0 && <span className="text-emerald-400">+{m.pointsReward} ⭐</span>}
                {m.packReward && <span className="text-blue-400">📦 Pack</span>}
              </div>

              {feedback[m.id] ? (
                <p className={`text-xs ${feedback[m.id].success ? 'text-emerald-400' : 'text-red-400'}`}>
                  {feedback[m.id].success ? '✓ ' : '✗ '}{feedback[m.id].message}
                </p>
              ) : m.completed ? (
                <p className="text-xs text-emerald-400">✓ Completed</p>
              ) : isConfirming ? (
                <div className="space-y-2">
                  <p className="text-xs text-purple-300 bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-2">
                    ⚠️ This weekly mission can only be claimed once this week. Did you actually complete the challenge?
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => onConfirm(m.id)}
                      loading={completing === m.id}
                      className="flex-1"
                    >
                      Yes, Claim Reward
                    </Button>
                    <button
                      onClick={onCancelConfirm}
                      className="flex-1 text-xs text-slate-400 hover:text-slate-300 border border-slate-600 rounded-lg py-1.5 px-3 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  {actionLink && !m.completed && (
                    <Link href={actionLink} className="flex-1">
                      <button className="w-full text-xs border border-slate-600 hover:border-amber-500/50 rounded-lg py-1.5 px-3 text-slate-400 hover:text-amber-400 transition-colors">
                        Go do it →
                      </button>
                    </Link>
                  )}
                  <Button
                    size="sm"
                    onClick={() => onComplete(m)}
                    loading={completing === m.id}
                    className={actionLink ? 'flex-1' : 'w-full'}
                    variant={isWeekly ? 'outline' : 'primary'}
                  >
                    {isWeekly ? 'Claim Weekly Reward' : 'Complete'}
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

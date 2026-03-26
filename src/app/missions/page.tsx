'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

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

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Record<string, { success: boolean; message: string }>>({})

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

  const daily = missions.filter(m => m.scope === 'DAILY')
  const weekly = missions.filter(m => m.scope === 'WEEKLY')

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Missions 🎯</h1>
          <p className="text-slate-400 text-sm mt-1">Complete missions to earn entries and points</p>
        </div>

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
            <MissionSection title="📅 Daily Missions" missions={daily} completing={completing} feedback={feedback} onComplete={completeMission} />
            <MissionSection title="📆 Weekly Missions" missions={weekly} completing={completing} feedback={feedback} onComplete={completeMission} />
          </>
        )}
      </div>
    </AppLayout>
  )
}

function MissionSection({ title, missions, completing, feedback, onComplete }: any) {
  if (missions.length === 0) return null
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-200 mb-3">{title}</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {missions.map((m: Mission) => (
          <div key={m.id} className={`bg-slate-800 rounded-xl border p-5 transition-all ${m.completed ? 'border-emerald-500/30 opacity-70' : 'border-slate-700 hover:border-amber-500/30'}`}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`font-medium text-sm ${m.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                    {m.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-400">{m.description}</p>
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
            ) : !m.completed ? (
              <Button
                size="sm"
                onClick={() => onComplete(m.id)}
                loading={completing === m.id}
                className="w-full"
              >
                Complete
              </Button>
            ) : (
              <p className="text-xs text-emerald-400">✓ Completed</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

'use client'
import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'

const settingDescriptions: Record<string, string> = {
  daily_reward_entries: 'Entries awarded for daily claim',
  daily_reward_points: 'Points awarded for daily claim',
  streak_bonus_interval: 'Days between streak bonus rewards',
  streak_bonus_entries: 'Bonus entries on streak milestone',
  streak_bonus_points: 'Bonus points on streak milestone',
  streak_pack_interval: 'Days between pack rewards for streak',
  daily_entry_cap: 'Max entries a user can earn per day',
  trivia_correct_entries: 'Entries for correct trivia answer',
  trivia_correct_points: 'Points for correct trivia answer',
  free_entry_daily_limit: 'Max free entries per day (per email)',
  free_entry_weekly_limit: 'Max free entries per week (per email)',
  free_entry_entries_granted: 'Entries granted per free submission',
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any[]>([])
  const [editing, setEditing] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(d => {
      setSettings(d.settings ?? [])
      setLoading(false)
    })
  }, [])

  async function save(key: string) {
    setSaving(key)
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value: editing[key] }),
    })
    setSaving(null)
    if (res.ok) {
      setSettings(prev => prev.map(s => s.key === key ? { ...s, value: editing[key] } : s))
      setFeedback(prev => ({ ...prev, [key]: 'Saved!' }))
      setTimeout(() => setFeedback(prev => { const n = { ...prev }; delete n[key]; return n }), 2000)
      setEditing(prev => { const n = { ...prev }; delete n[key]; return n })
    }
  }

  if (loading) return <div className="text-center py-12 text-slate-400">Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">App Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Configure reward amounts, limits, and other settings</p>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 divide-y divide-slate-700">
        {settings.map(s => (
          <div key={s.key} className="flex items-center gap-4 px-5 py-4">
            <div className="flex-1 min-w-0">
              <p className="font-mono text-sm text-amber-400">{s.key}</p>
              <p className="text-xs text-slate-400 mt-0.5">{settingDescriptions[s.key] ?? s.description ?? ''}</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editing[s.key] ?? s.value}
                onChange={e => setEditing(prev => ({ ...prev, [s.key]: e.target.value }))}
                className="w-28 bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50 text-right"
              />
              {editing[s.key] !== undefined && editing[s.key] !== s.value ? (
                <Button size="sm" loading={saving === s.key} onClick={() => save(s.key)}>Save</Button>
              ) : feedback[s.key] ? (
                <span className="text-xs text-emerald-400 w-10">{feedback[s.key]}</span>
              ) : (
                <span className="w-16" />
              )}
            </div>
          </div>
        ))}
        {settings.length === 0 && (
          <p className="text-center text-slate-400 py-8">No settings found. Run the database seed first.</p>
        )}
      </div>
    </div>
  )
}

'use client'
import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'

export default function AdminDrawingsPage() {
  const [drawings, setDrawings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', drawDate: '', prizeDescription: '', prizeValue: '' })

  function update(k: string, v: string) { setForm(p => ({ ...p, [k]: v })) }

  useEffect(() => {
    fetch('/api/admin/drawings').then(r => r.json()).then(d => { setDrawings(d.drawings ?? []); setLoading(false) })
  }, [])

  async function createDrawing(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    const res = await fetch('/api/admin/drawings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setCreating(false)
    if (data.drawing) {
      setDrawings(prev => [data.drawing, ...prev])
      setShowCreate(false)
      setForm({ title: '', description: '', drawDate: '', prizeDescription: '', prizeValue: '' })
    }
  }

  const statusColors: Record<string, string> = {
    UPCOMING: 'text-blue-400 bg-blue-500/20',
    ACTIVE: 'text-emerald-400 bg-emerald-500/20',
    COMPLETED: 'text-slate-400 bg-slate-700',
    CANCELLED: 'text-red-400 bg-red-500/20',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Prize Drawings</h1>
          <p className="text-slate-400 text-sm mt-1">Manage drawings and prize events</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ New Drawing</Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading...</div>
      ) : (
        <div className="space-y-4">
          {drawings.map(d => (
            <div key={d.id} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-100">{d.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[d.status] ?? ''}`}>{d.status}</span>
                  </div>
                  {d.description && <p className="text-sm text-slate-400 mb-2">{d.description}</p>}
                  <p className="text-amber-400 text-sm">🏆 {d.prizeDescription}</p>
                </div>
                <p className="text-sm text-slate-400 flex-shrink-0">{new Date(d.drawDate).toLocaleDateString()}</p>
              </div>
              {d.winners?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Winners:</p>
                  {d.winners.map((w: any) => (
                    <p key={w.id} className="text-sm text-emerald-400">🎉 {w.displayName}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
          {drawings.length === 0 && <p className="text-center text-slate-400 py-8">No drawings yet</p>}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Drawing">
        <form onSubmit={createDrawing} className="space-y-4">
          {[
            { key: 'title', label: 'Title', type: 'text', required: true },
            { key: 'description', label: 'Description', type: 'text' },
            { key: 'drawDate', label: 'Draw Date', type: 'datetime-local', required: true },
            { key: 'prizeDescription', label: 'Prize Description', type: 'text', required: true },
            { key: 'prizeValue', label: 'Prize Value ($)', type: 'number' },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{field.label}</label>
              <input
                type={field.type}
                value={(form as any)[field.key]}
                onChange={e => update(field.key, e.target.value)}
                required={field.required}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" type="button" className="flex-1" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" loading={creating} className="flex-1">Create Drawing</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

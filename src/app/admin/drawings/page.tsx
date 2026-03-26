'use client'
import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Image from 'next/image'

const emptyCard = {
  cardTitle: '',
  cardPlayer: '',
  cardYear: '',
  cardBrand: '',
  cardGrade: '',
  cardNumber: '',
  cardImageUrl: '',
}

export default function AdminDrawingsPage() {
  const [drawings, setDrawings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', drawDate: '', prizeDescription: '', prizeValue: '' })

  // Card editor state — keyed by drawing id
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [cardForms, setCardForms] = useState<Record<string, typeof emptyCard>>({})
  const [savingCard, setSavingCard] = useState<string | null>(null)
  const [savedCard, setSavedCard] = useState<string | null>(null)

  function update(k: string, v: string) { setForm(p => ({ ...p, [k]: v })) }

  useEffect(() => {
    fetch('/api/admin/drawings').then(r => r.json()).then(d => {
      const list = d.drawings ?? []
      setDrawings(list)
      // Pre-populate card forms with existing data
      const forms: Record<string, typeof emptyCard> = {}
      list.forEach((dr: any) => {
        forms[dr.id] = {
          cardTitle: dr.cardTitle ?? '',
          cardPlayer: dr.cardPlayer ?? '',
          cardYear: dr.cardYear ?? '',
          cardBrand: dr.cardBrand ?? '',
          cardGrade: dr.cardGrade ?? '',
          cardNumber: dr.cardNumber ?? '',
          cardImageUrl: dr.cardImageUrl ?? '',
        }
      })
      setCardForms(forms)
      setLoading(false)
    })
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
      setCardForms(prev => ({ ...prev, [data.drawing.id]: { ...emptyCard } }))
      setShowCreate(false)
      setForm({ title: '', description: '', drawDate: '', prizeDescription: '', prizeValue: '' })
    }
  }

  async function saveCard(drawingId: string) {
    setSavingCard(drawingId)
    const res = await fetch('/api/admin/drawings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: drawingId, ...cardForms[drawingId] }),
    })
    const data = await res.json()
    setSavingCard(null)
    if (data.drawing) {
      setDrawings(prev => prev.map(d => d.id === drawingId ? { ...d, ...data.drawing } : d))
      setSavedCard(drawingId)
      setTimeout(() => setSavedCard(null), 2500)
    }
  }

  function updateCard(drawingId: string, key: string, val: string) {
    setCardForms(prev => ({ ...prev, [drawingId]: { ...prev[drawingId], [key]: val } }))
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
          <p className="text-slate-400 text-sm mt-1">Manage drawings and featured card showcases</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ New Drawing</Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading...</div>
      ) : (
        <div className="space-y-4">
          {drawings.map(d => {
            const cardForm = cardForms[d.id] ?? { ...emptyCard }
            const isExpanded = expandedCard === d.id
            const hasCard = !!(d.cardTitle || d.cardImageUrl)

            return (
              <div key={d.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                {/* Drawing header */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-100">{d.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[d.status] ?? ''}`}>{d.status}</span>
                        {hasCard && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">🃏 Card set</span>
                        )}
                      </div>
                      {d.description && <p className="text-sm text-slate-400 mb-2">{d.description}</p>}
                      <p className="text-amber-400 text-sm">🏆 {d.prizeDescription}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm text-slate-400 mb-2">{new Date(d.drawDate).toLocaleDateString()}</p>
                      <button
                        onClick={() => setExpandedCard(isExpanded ? null : d.id)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                      >
                        {isExpanded ? '▲ Hide card editor' : '🃏 Edit featured card'}
                      </button>
                    </div>
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

                {/* Featured Card Editor */}
                {isExpanded && (
                  <div className="border-t border-slate-700 bg-slate-900/50 p-5">
                    <h4 className="text-sm font-semibold text-slate-200 mb-4">🃏 Featured Card Showcase</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Form fields */}
                      <div className="space-y-3">
                        {[
                          { key: 'cardTitle', label: 'Card Title', placeholder: 'e.g. Patrick Mahomes II Rookie Card' },
                          { key: 'cardPlayer', label: 'Player / Subject', placeholder: 'e.g. Patrick Mahomes II' },
                          { key: 'cardYear', label: 'Year', placeholder: 'e.g. 2017' },
                          { key: 'cardBrand', label: 'Brand / Set', placeholder: 'e.g. Panini Score' },
                          { key: 'cardGrade', label: 'Grade', placeholder: 'e.g. PSA 10' },
                          { key: 'cardNumber', label: 'Card Number', placeholder: 'e.g. #403' },
                          { key: 'cardImageUrl', label: 'Card Image URL', placeholder: 'https://...' },
                        ].map(field => (
                          <div key={field.key}>
                            <label className="block text-xs font-medium text-slate-400 mb-1">{field.label}</label>
                            <input
                              type="text"
                              value={(cardForm as any)[field.key]}
                              onChange={e => updateCard(d.id, field.key, e.target.value)}
                              placeholder={field.placeholder}
                              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                            />
                          </div>
                        ))}

                        <div className="flex gap-3 pt-2">
                          <Button
                            onClick={() => saveCard(d.id)}
                            loading={savingCard === d.id}
                            className="flex-1"
                          >
                            {savedCard === d.id ? '✅ Saved!' : 'Save Card Details'}
                          </Button>
                        </div>
                      </div>

                      {/* Live preview */}
                      <div>
                        <p className="text-xs text-slate-400 mb-2">Live Preview</p>
                        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                          {cardForm.cardImageUrl ? (
                            <div className="relative w-full aspect-[3/4] max-w-[200px] mx-auto mb-3 rounded-lg overflow-hidden bg-slate-700">
                              {/* PSA slab preview */}
                              <div className="absolute top-0 left-0 right-0 bg-blue-700 h-7 flex items-center justify-center z-10">
                                <span className="text-white text-[9px] font-bold tracking-widest uppercase">PSA</span>
                              </div>
                              <img
                                src={cardForm.cardImageUrl}
                                alt={cardForm.cardTitle || 'Card preview'}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                              />
                              {cardForm.cardGrade && (
                                <div className="absolute top-7 right-1.5 bg-amber-400 text-slate-900 text-[10px] font-extrabold px-1.5 py-0.5 rounded z-10">
                                  {cardForm.cardGrade}
                                </div>
                              )}
                              <div className="absolute bottom-0 left-0 right-0 bg-blue-800 h-6 flex items-center justify-center z-10">
                                <span className="text-white text-[8px] font-bold tracking-wider">AUTHENTIC</span>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full aspect-[3/4] max-w-[200px] mx-auto mb-3 rounded-lg bg-slate-700 border-2 border-dashed border-slate-600 flex items-center justify-center">
                              <p className="text-slate-500 text-xs text-center px-2">Enter image URL to preview card</p>
                            </div>
                          )}
                          {(cardForm.cardPlayer || cardForm.cardTitle) && (
                            <div className="text-center space-y-0.5">
                              <p className="text-slate-100 font-semibold text-sm">{cardForm.cardPlayer || '—'}</p>
                              <p className="text-slate-400 text-xs">{[cardForm.cardYear, cardForm.cardBrand].filter(Boolean).join(' · ')}</p>
                              <p className="text-slate-400 text-xs">{[cardForm.cardGrade, cardForm.cardNumber].filter(Boolean).join(' · ')}</p>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-2 text-center">This is how the card appears on the prizes page</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
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
          <p className="text-xs text-slate-500">You can add the featured card image and details after creating the drawing.</p>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" type="button" className="flex-1" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" loading={creating} className="flex-1">Create Drawing</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

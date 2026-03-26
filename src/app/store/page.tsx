'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'

interface StoreItem {
  id: string
  title: string
  description: string | null
  pointsCost: number
  itemType: string
  itemValue: number
  imageColor: string | null
  inventory: number | null
  proOnly: boolean
}

const typeIcons: Record<string, string> = {
  entries: '🎟️', pack: '📦', premium_pack: '💎', streak_restore: '🔥', reward_token: '🎫',
}

export default function StorePage() {
  const [items, setItems] = useState<StoreItem[]>([])
  const [userPoints, setUserPoints] = useState(0)
  const [loading, setLoading] = useState(true)
  const [redeeming, setRedeeming] = useState<string | null>(null)
  const [confirmItem, setConfirmItem] = useState<StoreItem | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  async function loadStore() {
    const res = await fetch('/api/store')
    const data = await res.json()
    setItems(data.items ?? [])
    setUserPoints(data.userPoints ?? 0)
    setLoading(false)
  }

  useEffect(() => { loadStore() }, [])

  async function redeem(item: StoreItem) {
    setConfirmItem(null)
    setRedeeming(item.id)
    const res = await fetch('/api/store/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeItemId: item.id }),
    })
    const data = await res.json()
    setRedeeming(null)

    if (data.success) {
      setFeedback({ type: 'success', message: `✓ Redeemed: ${item.title}` })
      setUserPoints(p => p - item.pointsCost)
    } else {
      setFeedback({ type: 'error', message: data.error ?? 'Failed to redeem' })
    }
    setTimeout(() => setFeedback(null), 3000)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Store 🛒</h1>
            <p className="text-slate-400 text-sm mt-1">Spend your points on entries and items</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-center">
            <p className="text-xs text-slate-400">Your Points</p>
            <p className="text-xl font-bold text-emerald-400">⭐ {userPoints.toLocaleString()}</p>
          </div>
        </div>

        {feedback && (
          <div className={`rounded-lg px-4 py-3 text-sm ${feedback.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
            {feedback.message}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading store...</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map(item => {
              const canAfford = userPoints >= item.pointsCost
              const icon = typeIcons[item.itemType] ?? '🎁'
              return (
                <div key={item.id} className={`bg-slate-800 rounded-xl border p-5 flex flex-col ${canAfford ? 'border-slate-700 hover:border-amber-500/30' : 'border-slate-700/50 opacity-70'} transition-colors`}>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{icon}</span>
                    {item.proOnly && <Badge variant="amber">PRO</Badge>}
                    {item.inventory !== null && item.inventory <= 5 && item.inventory > 0 && (
                      <Badge variant="red">Only {item.inventory} left</Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-100 mb-1">{item.title}</h3>
                  {item.description && <p className="text-xs text-slate-400 mb-3 flex-1">{item.description}</p>}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-700">
                    <span className="font-bold text-emerald-400">⭐ {item.pointsCost.toLocaleString()}</span>
                    <Button
                      size="sm"
                      disabled={!canAfford || redeeming === item.id}
                      loading={redeeming === item.id}
                      onClick={() => setConfirmItem(item)}
                      variant={canAfford ? 'primary' : 'secondary'}
                    >
                      {canAfford ? 'Redeem' : 'Need points'}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Modal isOpen={!!confirmItem} onClose={() => setConfirmItem(null)} title="Confirm Purchase">
        {confirmItem && (
          <div className="space-y-4">
            <p className="text-slate-300">
              Redeem <strong className="text-amber-400">{confirmItem.title}</strong> for{' '}
              <strong className="text-emerald-400">⭐ {confirmItem.pointsCost.toLocaleString()} points</strong>?
            </p>
            <p className="text-sm text-slate-400">
              You&apos;ll have <strong>{(userPoints - confirmItem.pointsCost).toLocaleString()}</strong> points remaining.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setConfirmItem(null)}>Cancel</Button>
              <Button className="flex-1" onClick={() => redeem(confirmItem)}>Confirm</Button>
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  )
}

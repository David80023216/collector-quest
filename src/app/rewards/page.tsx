'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'

interface Pack {
  id: string
  itemId: string
  quantity: number
  acquiredAt: string
  definition: { name: string; rarity: string; imageColor: string; description: string } | null
}

export default function RewardsPage() {
  const [packs, setPacks] = useState<Pack[]>([])
  const [loading, setLoading] = useState(true)
  const [opening, setOpening] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)

  async function loadPacks() {
    const res = await fetch('/api/packs')
    const data = await res.json()
    setPacks(data.packs ?? [])
    setLoading(false)
  }

  useEffect(() => { loadPacks() }, [])

  async function openPack(inventoryId: string) {
    setOpening(inventoryId)
    const res = await fetch('/api/packs/open', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inventoryId }),
    })
    const data = await res.json()
    setOpening(null)

    if (data.success) {
      setResult(data.reward)
      setShowModal(true)
      loadPacks()
    }
  }

  const rarityColors: Record<string, string> = {
    legendary: 'from-amber-500/30 to-yellow-600/20 border-amber-500/50',
    epic: 'from-purple-500/30 to-purple-600/20 border-purple-500/50',
    rare: 'from-blue-500/30 to-blue-600/20 border-blue-500/50',
    standard: 'from-slate-700/50 to-slate-800/50 border-slate-600',
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Reward Packs 📦</h1>
          <p className="text-slate-400 text-sm mt-1">Open packs to reveal entries, points, and bonus items</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading packs...</div>
        ) : packs.length === 0 ? (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-lg font-semibold text-slate-200 mb-2">No packs in inventory</h3>
            <p className="text-slate-400 text-sm mb-6">Complete missions and maintain your streak to earn reward packs</p>
            <Button variant="outline" onClick={() => window.location.href = '/missions'}>View Missions</Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {packs.map(pack => {
              const rarity = pack.definition?.rarity ?? 'standard'
              const color = rarityColors[rarity] ?? rarityColors.standard
              return (
                <div key={pack.id} className={`rounded-xl border bg-gradient-to-br p-6 ${color} relative overflow-hidden pack-shine`}>
                  <div className="relative z-10">
                    <div className="text-5xl mb-3 text-center" style={{ filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.4))' }}>📦</div>
                    <h3 className="font-bold text-lg text-slate-100 text-center mb-1">
                      {pack.definition?.name ?? 'Mystery Pack'}
                    </h3>
                    <p className="text-sm text-slate-400 text-center mb-1 capitalize">{rarity}</p>
                    {pack.quantity > 1 && (
                      <p className="text-xs text-amber-400 text-center mb-3">×{pack.quantity} available</p>
                    )}
                    {pack.definition?.description && (
                      <p className="text-xs text-slate-400 text-center mb-4">{pack.definition.description}</p>
                    )}
                    <Button
                      className="w-full"
                      loading={opening === pack.id}
                      onClick={() => openPack(pack.id)}
                    >
                      Open Pack ✨
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="📦 Pack Opened!">
        {result && (
          <div className="text-center space-y-4">
            <div className="text-6xl">🎊</div>
            <div>
              <p className="text-xl font-bold text-amber-400">{result.label}</p>
              <p className="text-sm text-slate-400 mt-1 capitalize">{result.rarity} reward</p>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-4">
              <p className="text-3xl font-black text-amber-400">
                {result.type === 'ENTRIES' && `+${result.value} 🎟️`}
                {result.type === 'POINTS' && `+${result.value} ⭐`}
                {result.type === 'BONUS_PACK' && '📦 Bonus Pack!'}
                {result.type === 'STREAK_BOOST' && `🔥 +${result.value} Streak Days`}
                {result.type === 'REWARD_TOKEN' && `🎫 ×${result.value} Token`}
              </p>
            </div>
            <Button onClick={() => setShowModal(false)} className="w-full">Collect!</Button>
          </div>
        )}
      </Modal>
    </AppLayout>
  )
}

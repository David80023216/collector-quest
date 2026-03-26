'use client'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { useRouter } from 'next/navigation'

interface Props { canClaim: boolean; streak: number }

export default function DailyRewardButton({ canClaim, streak }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)

  async function claim() {
    setLoading(true)
    const res = await fetch('/api/daily-reward', { method: 'POST' })
    const data = await res.json()
    setLoading(false)
    if (data.success) {
      setResult(data)
      setShowModal(true)
      router.refresh()
    }
  }

  return (
    <>
      <Button
        onClick={claim}
        loading={loading}
        disabled={!canClaim}
        variant={canClaim ? 'primary' : 'secondary'}
        className={canClaim ? 'animate-pulse' : ''}
      >
        {canClaim ? '🎁 Claim Daily Reward' : '✓ Claimed Today'}
      </Button>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="🎁 Daily Reward Claimed!">
        {result && (
          <div className="text-center space-y-4">
            <div className="text-5xl">🎉</div>
            <div>
              <p className="text-lg font-bold text-amber-400">Day {result.streakDay} Streak!</p>
              {result.streakBonus && (
                <p className="text-sm text-emerald-400 mt-1">🔥 Streak bonus applied!</p>
              )}
            </div>
            <div className="flex justify-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-400">+{result.entries}</p>
                <p className="text-xs text-slate-400">Entries</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-400">+{result.points}</p>
                <p className="text-xs text-slate-400">Points</p>
              </div>
              {result.packAwarded && (
                <div className="text-center">
                  <p className="text-2xl">📦</p>
                  <p className="text-xs text-slate-400">Pack!</p>
                </div>
              )}
            </div>
            <Button onClick={() => setShowModal(false)} className="w-full">Awesome!</Button>
          </div>
        )}
      </Modal>
    </>
  )
}

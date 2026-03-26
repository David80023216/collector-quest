'use client'
import { useState } from 'react'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    setLoading(false)
    if (res.ok) {
      setSent(true)
    } else {
      const data = await res.json()
      setError(data.error ?? 'Something went wrong')
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-2xl">
        {sent ? (
          <div className="text-center">
            <div className="text-5xl mb-4">📬</div>
            <h1 className="text-xl font-bold text-slate-100 mb-2">Check your inbox</h1>
            <p className="text-slate-400 text-sm mb-6">
              If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link.
            </p>
            <Link href="/login" className="text-amber-400 hover:text-amber-300 font-medium text-sm">
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-slate-100 mb-2">Reset password</h1>
            <p className="text-slate-400 text-sm mb-6">Enter your email and we&apos;ll send a reset link</p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  placeholder="you@example.com"
                />
              </div>
              <Button type="submit" loading={loading} className="w-full" size="lg">
                Send Reset Link
              </Button>
            </form>

            <p className="text-center text-sm text-slate-400 mt-6">
              <Link href="/login" className="text-amber-400 hover:text-amber-300">Back to sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

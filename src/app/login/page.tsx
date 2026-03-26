'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(k: string, v: string) { setForm(p => ({ ...p, [k]: v })); setError('') }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await signIn('credentials', { ...form, redirect: false })
    setLoading(false)
    if (res?.ok) {
      router.push('/dashboard')
      router.refresh()
    } else {
      setError('Invalid email or password')
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4">
      <Link href="/" className="flex items-center gap-2 font-bold text-xl text-amber-400 mb-8">
        <span className="text-2xl">🏆</span> Collector Quest
      </Link>
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-slate-100 mb-1">Welcome back</h1>
        <p className="text-slate-400 text-sm mb-6">Sign in to your account</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
            <input
              type="email" required autoComplete="email"
              value={form.email} onChange={e => update('email', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
            <input
              type="password" required autoComplete="current-password"
              value={form.password} onChange={e => update('password', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" loading={loading} className="w-full" size="lg">
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          No account?{' '}
          <Link href="/signup" className="text-amber-400 hover:text-amber-300 font-medium">Create one free</Link>
        </p>
      </div>
    </div>
  )
}

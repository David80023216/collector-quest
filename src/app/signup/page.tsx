'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(k: string, v: string) { setForm(p => ({ ...p, [k]: v })); setError('') }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setLoading(false); setError(data.error ?? 'Registration failed'); return }
    await signIn('credentials', { email: form.email, password: form.password, redirect: false })
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4">
      <Link href="/" className="flex items-center gap-2 font-bold text-xl text-amber-400 mb-8">
        <span className="text-2xl">🏆</span> Collector Quest
      </Link>
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-slate-100 mb-1">Create free account</h1>
        <p className="text-slate-400 text-sm mb-6">Start earning entries and winning prizes today</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: 'name', label: 'Your name', type: 'text', placeholder: 'Collector Joe', auto: 'name' },
            { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', auto: 'email' },
            { key: 'password', label: 'Password', type: 'password', placeholder: 'Min 8 characters', auto: 'new-password' },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{field.label}</label>
              <input
                type={field.type} required autoComplete={field.auto}
                value={(form as any)[field.key]}
                onChange={e => update(field.key, e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                placeholder={field.placeholder}
              />
            </div>
          ))}
          <Button type="submit" loading={loading} className="w-full" size="lg">
            Create Account Free 🚀
          </Button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-4">
          By creating an account you agree to our{' '}
          <Link href="/terms" className="text-amber-400/70 hover:text-amber-400">Terms</Link>{' '}and{' '}
          <Link href="/privacy" className="text-amber-400/70 hover:text-amber-400">Privacy Policy</Link>
        </p>

        <p className="text-center text-sm text-slate-400 mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-amber-400 hover:text-amber-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

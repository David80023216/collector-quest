'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Failed to create account')
      setLoading(false)
      return
    }

    const result = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    })

    setLoading(false)
    if (result?.ok) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-slate-100 mb-2">Create your account</h1>
        <p className="text-slate-400 text-sm mb-6">Start collecting rewards and winning prizes</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {(['name', 'email', 'password', 'confirmPassword'] as const).map(field => (
            <div key={field}>
              <label className="block text-sm font-medium text-slate-300 mb-1.5 capitalize">
                {field === 'confirmPassword' ? 'Confirm Password' : field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input
                type={field.includes('password') || field.includes('Password') ? 'password' : field === 'email' ? 'email' : 'text'}
                value={form[field]}
                onChange={e => update(field, e.target.value)}
                required
                minLength={field.includes('assword') ? 8 : undefined}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
                placeholder={field === 'email' ? 'you@example.com' : field.includes('assword') ? '••••••••' : ''}
              />
            </div>
          ))}
          <Button type="submit" loading={loading} className="w-full" size="lg">
            Create Free Account
          </Button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-amber-400 hover:text-amber-300 font-medium">Sign in</Link>
        </p>

        <p className="text-center text-xs text-slate-500 mt-4">
          By signing up you agree to our{' '}
          <Link href="/legal/terms" className="text-slate-400 hover:text-slate-300">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/legal/privacy" className="text-slate-400 hover:text-slate-300">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}

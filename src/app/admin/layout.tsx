import { requireAdmin } from '@/lib/auth-helpers'
import Link from 'next/link'

const adminLinks = [
  { href: '/admin', label: '📊 Overview' },
  { href: '/admin/users', label: '👥 Users' },
  { href: '/admin/settings', label: '⚙️ Settings' },
  { href: '/admin/drawings', label: '🎰 Drawings' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-slate-900">
      <nav className="border-b border-slate-700/50 bg-slate-900/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-amber-400 font-bold flex items-center gap-2">
              <span>🏆</span> Collector Quest
            </Link>
            <span className="text-slate-600">|</span>
            <span className="text-purple-400 font-semibold text-sm">Admin Panel</span>
          </div>
          <div className="flex items-center gap-1">
            {adminLinks.map(link => (
              <Link key={link.href} href={link.href} className="px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-100 hover:bg-slate-700/50 transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">{children}</main>
    </div>
  )
}

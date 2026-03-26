'use client'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  { href: '/dashboard', icon: '🏠', label: 'Home' },
  { href: '/missions', icon: '🎯', label: 'Missions' },
  { href: '/rewards', icon: '📦', label: 'Packs' },
  { href: '/store', icon: '🛒', label: 'Store' },
  { href: '/prizes', icon: '🏆', label: 'Prizes' },
  { href: '/leaderboards', icon: '📊', label: 'Boards' },
  { href: '/community', icon: '🤝', label: 'Community' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Top nav */}
      <nav className="border-b border-slate-700/50 bg-slate-900/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-amber-400">
            <span className="text-xl">🏆</span>
            <span className="hidden sm:block">Collector Quest</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-1.5
                  ${pathname === item.href ? 'bg-amber-500/10 text-amber-400' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-700/50'}`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {session?.user?.plan === 'PRO' && (
              <span className="hidden sm:flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 rounded-full px-2.5 py-1 text-xs font-bold text-amber-400">
                ⭐ PRO
              </span>
            )}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(p => !p)}
                className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 font-bold text-sm flex items-center justify-center hover:bg-amber-500/30 transition-colors"
              >
                {session?.user?.name?.[0]?.toUpperCase() ?? 'U'}
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-11 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 py-1">
                    <div className="px-4 py-2.5 border-b border-slate-700">
                      <p className="text-sm font-medium text-slate-100 truncate">{session?.user?.name}</p>
                      <p className="text-xs text-slate-400 truncate">{session?.user?.email}</p>
                    </div>
                    <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-700/50">
                      👤 Profile
                    </Link>
                    {session?.user?.role === 'ADMIN' && (
                      <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-purple-400 hover:bg-slate-700/50">
                        🛠 Admin
                      </Link>
                    )}
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-slate-700/50"
                    >
                      ↩ Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button className="md:hidden text-slate-400 hover:text-slate-100 p-1" onClick={() => setMenuOpen(p => !p)}>
              ☰
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-700/50 bg-slate-900 px-4 py-3 space-y-1">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                  ${pathname === item.href ? 'bg-amber-500/10 text-amber-400' : 'text-slate-400 hover:text-slate-100'}`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        )}
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">{children}</main>
    </div>
  )
}

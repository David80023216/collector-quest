'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useState } from 'react'

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/missions', label: 'Missions', icon: '🎯' },
  { href: '/rewards', label: 'Packs', icon: '📦' },
  { href: '/store', label: 'Store', icon: '🛒' },
  { href: '/community', label: 'Community', icon: '🤝' },
  { href: '/prizes', label: 'Prizes', icon: '🏆' },
  { href: '/leaderboards', label: 'Leaderboard', icon: '📊' },
]

interface NavbarProps {
  entries?: number
  points?: number
}

export default function Navbar({ entries = 0, points = 0 }: NavbarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-slate-900/95 backdrop-blur border-b border-slate-700/50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-amber-400 flex-shrink-0">
            <span className="text-2xl">🏆</span>
            <span className="hidden sm:block">Collector Quest</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5
                  ${pathname === link.href
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-700/50'
                  }`}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side: stats + user */}
          <div className="flex items-center gap-3">
            {/* Stats */}
            <div className="hidden sm:flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                <span className="text-amber-400">🎟️</span>
                <span className="font-semibold text-amber-400">{entries.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                <span className="text-emerald-400">⭐</span>
                <span className="font-semibold text-emerald-400">{points.toLocaleString()}</span>
              </div>
            </div>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-9 h-9 rounded-full bg-amber-500 text-slate-900 font-bold text-sm flex items-center justify-center hover:bg-amber-400 transition-colors"
              >
                {session?.user?.name?.[0]?.toUpperCase() ?? 'U'}
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-700">
                      <p className="text-sm font-medium text-slate-100 truncate">{session?.user?.name}</p>
                      <p className="text-xs text-slate-400 truncate">{session?.user?.email}</p>
                    </div>
                    <Link href="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-colors">
                      👤 Profile
                    </Link>
                    {session?.user?.role === 'ADMIN' && (
                      <Link href="/admin" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-purple-400 hover:bg-slate-700 transition-colors">
                        ⚙️ Admin
                      </Link>
                    )}
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-slate-700 transition-colors"
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-700/50 z-40">
        <div className="grid grid-cols-7 max-w-sm mx-auto">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center py-2 text-xs gap-1 transition-colors
                ${pathname === link.href ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <span className="text-lg">{link.icon}</span>
              <span className="hidden">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}

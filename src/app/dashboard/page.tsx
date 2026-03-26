import { requireAuth } from '@/lib/auth-helpers'
import { redirect } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import prisma from '@/lib/prisma'
import { canClaimDaily } from '@/lib/daily-reward'
import { getTodaysMissions } from '@/lib/missions'
import DailyRewardButton from './DailyRewardButton'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await requireAuth()
  const userId = session.user.id

  const [user, canClaim, missions, recentActivity] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true, entries: true, points: true, plan: true,
        currentStreak: true, longestStreak: true, totalContributions: true,
        _count: { select: { userBadges: true, missionCompletions: true, rewardPackOpens: true } },
      },
    }),
    canClaimDaily(userId),
    getTodaysMissions(userId),
    prisma.userLedger.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  if (!user) redirect('/login')

  const completedToday = missions.filter(m => m.completed).length
  const totalToday = missions.length

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Welcome back, {user.name?.split(' ')[0] ?? 'Collector'}! 👋</h1>
            <p className="text-slate-400 text-sm mt-1">
              {user.plan === 'PRO'
                ? '⭐ PRO Member'
                : 'Free Plan — '}
              {user.currentStreak > 0 && ` 🔥 ${user.currentStreak} day streak`}
            </p>
          </div>
          <DailyRewardButton canClaim={canClaim} streak={user.currentStreak} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Entries', value: user.entries.toLocaleString(), icon: '🎟️', color: 'text-amber-400' },
            { label: 'Points', value: user.points.toLocaleString(), icon: '⭐', color: 'text-emerald-400' },
            { label: 'Streak', value: `${user.currentStreak}d`, icon: '🔥', color: 'text-orange-400' },
            { label: 'Badges', value: user._count.userBadges, icon: '🏅', color: 'text-purple-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-slate-800 rounded-xl border border-slate-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-400">{stat.label}</p>
                <span className="text-xl">{stat.icon}</span>
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Missions Progress */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-100">Today&apos;s Missions</h2>
            <Link href="/missions" className="text-sm text-amber-400 hover:text-amber-300">View all →</Link>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 bg-slate-700 rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all"
                style={{ width: totalToday > 0 ? `${(completedToday / totalToday) * 100}%` : '0%' }}
              />
            </div>
            <span className="text-sm text-slate-400">{completedToday}/{totalToday}</span>
          </div>
          {missions.slice(0, 3).map(m => (
            <div key={m.id} className="flex items-center gap-3 py-2.5 border-b border-slate-700/50 last:border-0">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${m.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-500'}`}>
                {m.completed ? '✓' : '○'}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${m.completed ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                  {m.title}
                </p>
              </div>
              <div className="text-xs text-amber-400 flex-shrink-0">+{m.entriesReward} 🎟️</div>
            </div>
          ))}
          {missions.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-4">No missions available today</p>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <h2 className="font-semibold text-slate-100 mb-4">Recent Activity</h2>
          {recentActivity.length > 0 ? (
            <div className="space-y-2">
              {recentActivity.map(tx => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                  <p className="text-sm text-slate-300 truncate flex-1 mr-4">{tx.description}</p>
                  <div className="flex gap-3 flex-shrink-0 text-xs">
                    {tx.entriesChange !== 0 && (
                      <span className={tx.entriesChange > 0 ? 'text-amber-400' : 'text-red-400'}>
                        {tx.entriesChange > 0 ? '+' : ''}{tx.entriesChange} 🎟️
                      </span>
                    )}
                    {tx.pointsChange !== 0 && (
                      <span className={tx.pointsChange > 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {tx.pointsChange > 0 ? '+' : ''}{tx.pointsChange} ⭐
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-4">No activity yet. Complete a mission to get started!</p>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { href: '/missions', icon: '🎯', label: 'Missions', color: 'hover:border-amber-500/30' },
            { href: '/rewards', icon: '📦', label: 'Open Packs', color: 'hover:border-blue-500/30' },
            { href: '/store', icon: '🛒', label: 'Store', color: 'hover:border-emerald-500/30' },
            { href: '/prizes', icon: '🏆', label: 'Prizes', color: 'hover:border-purple-500/30' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`bg-slate-800 rounded-xl border border-slate-700 p-4 text-center hover:bg-slate-700/50 transition-colors ${link.color}`}
            >
              <div className="text-3xl mb-2">{link.icon}</div>
              <p className="text-sm font-medium text-slate-300">{link.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}

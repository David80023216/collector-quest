import prisma from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const [totalUsers, proUsers, totalEntries, totalMissions, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { plan: 'PRO' } }),
    prisma.userLedger.aggregate({ _sum: { entriesChange: true } }),
    prisma.missionCompletion.count(),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, email: true, plan: true, createdAt: true },
    }),
  ])

  const stats = [
    { label: 'Total Users', value: totalUsers, icon: '👥', color: 'text-blue-400' },
    { label: 'PRO Members', value: proUsers, icon: '⭐', color: 'text-amber-400' },
    { label: 'Total Entries Given', value: (totalEntries._sum.entriesChange ?? 0).toLocaleString(), icon: '🎟️', color: 'text-emerald-400' },
    { label: 'Mission Completions', value: totalMissions.toLocaleString(), icon: '🎯', color: 'text-purple-400' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Admin Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Overview of Collector Quest platform</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-400">{s.label}</p>
              <span className="text-2xl">{s.icon}</span>
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-100">Recent Users</h2>
          <Link href="/admin/users" className="text-sm text-amber-400 hover:text-amber-300">View all →</Link>
        </div>
        <div className="space-y-2">
          {recentUsers.map(u => (
            <div key={u.id} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
              <div>
                <p className="text-sm font-medium text-slate-100">{u.name}</p>
                <p className="text-xs text-slate-400">{u.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${u.plan === 'PRO' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400'}`}>
                  {u.plan}
                </span>
                <span className="text-xs text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { href: '/admin/users', label: 'Manage Users', icon: '👥', desc: 'View and manage all users' },
          { href: '/admin/settings', label: 'App Settings', icon: '⚙️', desc: 'Configure rewards and limits' },
          { href: '/admin/drawings', label: 'Prize Drawings', icon: '🎰', desc: 'Create and manage drawings' },
        ].map(card => (
          <Link key={card.href} href={card.href} className="bg-slate-800 rounded-xl border border-slate-700 p-5 hover:border-purple-500/30 transition-colors">
            <div className="text-3xl mb-3">{card.icon}</div>
            <h3 className="font-semibold text-slate-100">{card.label}</h3>
            <p className="text-sm text-slate-400 mt-1">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

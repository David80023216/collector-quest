'use client'
import { useEffect, useState } from 'react'
import Badge from '@/components/ui/Badge'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  async function load(p = 1, q = '') {
    setLoading(true)
    const res = await fetch(`/api/admin/users?page=${p}&limit=20&search=${encodeURIComponent(q)}`)
    const data = await res.json()
    setUsers(data.users ?? [])
    setTotal(data.total ?? 0)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    load(1, search)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Users</h1>
        <p className="text-slate-400 text-sm mt-1">{total.toLocaleString()} total users</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        />
        <button type="submit" className="px-4 py-2.5 bg-amber-500 text-slate-900 font-semibold rounded-lg hover:bg-amber-400 transition-colors">
          Search
        </button>
      </form>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-700">
                <tr>
                  {['Name', 'Email', 'Plan', 'Entries', 'Streak', 'Missions', 'Joined'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-slate-100">{u.name ?? '—'}</td>
                    <td className="px-5 py-3 text-sm text-slate-400">{u.email}</td>
                    <td className="px-5 py-3">
                      <Badge variant={u.plan === 'PRO' ? 'amber' : 'slate'}>{u.plan}</Badge>
                    </td>
                    <td className="px-5 py-3 text-sm text-amber-400">{u.entries?.toLocaleString()}</td>
                    <td className="px-5 py-3 text-sm text-orange-400">{u.currentStreak}d</td>
                    <td className="px-5 py-3 text-sm text-slate-300">{u._count?.missionCompletions}</td>
                    <td className="px-5 py-3 text-xs text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <p className="text-center text-slate-400 py-8">No users found</p>}
          </div>
        )}
      </div>
    </div>
  )
}

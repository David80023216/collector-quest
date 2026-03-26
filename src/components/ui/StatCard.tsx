interface StatCardProps {
  label: string
  value: string | number
  icon?: string
  color?: string
  subtitle?: string
}

export default function StatCard({ label, value, icon, color = 'text-amber-400', subtitle }: StatCardProps) {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-slate-400">{label}</p>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <p className={`text-2xl font-bold ${color}`}>{typeof value === 'number' ? value.toLocaleString() : value}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </div>
  )
}

interface BadgeProps {
  children: React.ReactNode
  variant?: 'slate' | 'amber' | 'emerald' | 'red' | 'blue' | 'purple'
}

const variants = {
  slate: 'bg-slate-700 text-slate-300',
  amber: 'bg-amber-500/20 text-amber-400',
  emerald: 'bg-emerald-500/20 text-emerald-400',
  red: 'bg-red-500/20 text-red-400',
  blue: 'bg-blue-500/20 text-blue-400',
  purple: 'bg-purple-500/20 text-purple-400',
}

export default function Badge({ children, variant = 'slate' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  )
}

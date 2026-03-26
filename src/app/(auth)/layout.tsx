import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="flex items-center gap-2 mb-8 text-amber-400 font-bold text-2xl">
        <span className="text-3xl">🏆</span>
        <span>Collector Quest</span>
      </Link>
      {children}
    </div>
  )
}

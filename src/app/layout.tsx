import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SessionProvider from '@/components/providers/SessionProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Collector Quest – Win Real Sports Card Prizes',
  description: 'Complete daily missions, trivia, and polls to earn entries into real prize drawings. Free to play.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-900 text-slate-100 antialiased`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}

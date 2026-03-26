import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { Session } from 'next-auth'

export interface AuthSession extends Session {
  user: { id: string; name?: string | null; email?: string | null; image?: string | null; role?: string; plan?: string }
}

export async function requireAuth(): Promise<AuthSession> {
  const session = await getServerSession(authOptions) as AuthSession | null
  if (!session?.user?.id) redirect('/login')
  return session
}

export async function requireAdmin(): Promise<AuthSession> {
  const session = await requireAuth()
  if (session.user.role !== 'ADMIN') redirect('/dashboard')
  return session
}

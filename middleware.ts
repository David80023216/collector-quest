import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: { signIn: '/login' },
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/missions/:path*',
    '/rewards/:path*',
    '/store/:path*',
    '/prizes/:path*',
    '/leaderboards/:path*',
    '/community/:path*',
    '/trivia/:path*',
    '/polls/:path*',
    '/profile/:path*',
    '/admin/:path*',
  ],
}

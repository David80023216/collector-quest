import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Admin route protection — require admin role
    if (pathname.startsWith('/admin')) {
      if (token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl

        // Public auth pages — redirect to dashboard if already logged in
        if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
          if (token) {
            return false // will trigger redirect below
          }
          return true // allow access to login/signup for unauthenticated users
        }

        // Protected routes — require authentication
        // Note: /prizes is intentionally PUBLIC so visitors can see what's up for grabs
        const protectedPaths = [
          '/dashboard',
          '/missions',
          '/rewards',
          '/community',
          '/store',
          '/winners',
          '/leaderboards',
          '/profile',
          '/admin',
        ]

        const isProtected = protectedPaths.some((path) =>
          pathname.startsWith(path)
        )

        if (isProtected) {
          return !!token
        }

        // Allow all other routes
        return true
      },
    },
    pages: {
      signIn: '/login',
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/missions/:path*',
    '/rewards/:path*',
    '/community/:path*',
    '/store/:path*',
    '/winners/:path*',
    '/leaderboards/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/login',
    '/signup',
  ],
}

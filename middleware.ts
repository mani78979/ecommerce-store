import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  // Redirect to login if trying to access protected routes without token
  if ((pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Admin routes - check for admin role
  if (pathname.startsWith('/admin') && token) {
    const userRole = token.role as string
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*']
}
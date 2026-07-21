import { NextResponse, type NextRequest } from 'next/server'
import { verifyToken } from '@/lib/admin-auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin')) {
    // Always allow login page through
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }

    const cookie = request.cookies.get('admin_session')
    const valid = !!cookie?.value && verifyToken(cookie.value) !== null

    if (!valid) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}

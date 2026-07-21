import { NextResponse, type NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const { login, password } = await req.json()

  const adminLogin = process.env.ADMIN_LOGIN
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminLogin || !adminPassword) {
    return NextResponse.json({ ok: false, error: 'Admin credentials not configured' }, { status: 500 })
  }

  if (login !== adminLogin || password !== adminPassword) {
    return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set('admin_session', 'authenticated', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    secure: process.env.NODE_ENV === 'production',
  })
  return response
}

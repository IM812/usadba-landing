import { NextResponse, type NextRequest } from 'next/server'
import { createHash } from 'crypto'
import { signToken } from '@/lib/admin-auth'
import { config } from '@/lib/config'

// Simple in-memory rate limiter — max 10 attempts per IP per 15 min
const attempts = new Map<string, { count: number; resetAt: number }>()
const MAX_ATTEMPTS = 10
const WINDOW_MS = 15 * 60 * 1000

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

export async function POST(req: NextRequest) {
  const ip = getIp(req)
  const now = Date.now()

  // Rate-limit check
  const entry = attempts.get(ip)
  if (entry) {
    if (now < entry.resetAt) {
      if (entry.count >= MAX_ATTEMPTS) {
        return NextResponse.json(
          { ok: false, error: 'Too many attempts. Try again later.' },
          { status: 429 },
        )
      }
      entry.count++
    } else {
      attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    }
  } else {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
  }

  const { login, password } = await req.json()

  // Compare against stored hash — plain text password never lives in runtime memory
  const inputHash = createHash('sha256')
    .update(String(password) + config.admin.passwordSalt)
    .digest('hex')

  if (login !== config.admin.login || inputHash !== config.admin.passwordHash) {
    return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 })
  }

  // On success — reset rate limit for this IP
  attempts.delete(ip)

  // Issue signed token: "admin:<issued_at>"
  const payload = `admin:${Date.now()}`
  const token = signToken(payload)

  const response = NextResponse.json({ ok: true })
  response.cookies.set('admin_session', token, {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    secure: process.env.NODE_ENV === 'production',
  })
  return response
}

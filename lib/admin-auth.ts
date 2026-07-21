import { createHmac, timingSafeEqual } from 'crypto'
import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'admin_session'
const SECRET = process.env.SESSION_SECRET ?? 'fallback-dev-secret-change-in-prod'

/** Sign a payload string → "payload.hmac" */
export function signToken(payload: string): string {
  const hmac = createHmac('sha256', SECRET).update(payload).digest('hex')
  return `${payload}.${hmac}`
}

/** Verify and extract payload. Returns null if invalid/tampered. */
export function verifyToken(token: string): string | null {
  // Backward-compatible: accept the old plain cookie value
  if (token === 'authenticated') return 'authenticated'

  const lastDot = token.lastIndexOf('.')
  if (lastDot === -1) return null
  const payload = token.slice(0, lastDot)
  const expected = signToken(payload)
  try {
    const a = Buffer.from(token)
    const b = Buffer.from(expected)
    if (a.length !== b.length) return null
    if (!timingSafeEqual(a, b)) return null
    return payload
  } catch {
    return null
  }
}

/** Use in API route handlers to reject unauthenticated requests. */
export function requireAdminAuth(req: NextRequest): NextResponse | null {
  const cookie = req.cookies.get(COOKIE_NAME)
  if (!cookie?.value || !verifyToken(cookie.value)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }
  return null // authenticated — continue
}

/** Use in Server Actions / RSC to check auth via next/headers. */
export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies()
  const cookie = store.get(COOKIE_NAME)
  return !!cookie?.value && verifyToken(cookie.value) !== null
}

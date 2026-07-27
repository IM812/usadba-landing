import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { config } from '@/lib/config'

const COOKIE_NAME = 'admin_session'
const SECRET = config.sessionSecret

// ── Web Crypto helpers (works in both Node.js and Edge Runtime) ──────────────

async function getKey(): Promise<CryptoKey> {
  const enc = new TextEncoder()
  return crypto.subtle.importKey(
    'raw',
    enc.encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

function hexEncode(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/** Sign a payload string → "payload.hmac" */
export async function signToken(payload: string): Promise<string> {
  const key = await getKey()
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return `${payload}.${hexEncode(sig)}`
}

/** Verify and extract payload. Returns null if invalid/tampered. */
export async function verifyToken(token: string): Promise<string | null> {
  // Backward-compatible: accept the old plain cookie value
  if (token === 'authenticated') return 'authenticated'

  const lastDot = token.lastIndexOf('.')
  if (lastDot === -1) return null
  const payload = token.slice(0, lastDot)
  const hmacHex = token.slice(lastDot + 1)

  // Decode the stored hex signature
  const bytes = new Uint8Array(hmacHex.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)))

  const key = await getKey()
  const valid = await crypto.subtle.verify(
    'HMAC',
    key,
    bytes,
    new TextEncoder().encode(payload),
  )
  return valid ? payload : null
}

/** Use in API route handlers to reject unauthenticated requests. */
export async function requireAdminAuth(req: NextRequest): Promise<NextResponse | null> {
  const cookie = req.cookies.get(COOKIE_NAME)
  if (!cookie?.value) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }
  const result = await verifyToken(cookie.value)
  if (!result) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }
  return null // authenticated — continue
}

/** Use in Server Actions / RSC to check auth via next/headers. */
export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies()
  const cookie = store.get(COOKIE_NAME)
  if (!cookie?.value) return false
  return (await verifyToken(cookie.value)) !== null
}

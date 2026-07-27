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
  const lastDot = token.lastIndexOf('.')
  if (lastDot === -1) return null
  const payload = token.slice(0, lastDot)
  const hmacHex = token.slice(lastDot + 1)

  // Reject malformed signatures early (must be 64 hex chars for SHA-256)
  if (!/^[0-9a-f]{64}$/i.test(hmacHex)) return null

  // Payload must be "admin:<timestamp>" — reject anything else
  if (!/^admin:\d+$/.test(payload)) return null

  // Enforce max session age (7 days) even if cookie maxAge is bypassed
  const issuedAt = Number(payload.slice(6))
  if (!Number.isFinite(issuedAt) || Date.now() - issuedAt > 7 * 24 * 60 * 60 * 1000) return null

  // Decode the stored hex signature
  const pairs = hmacHex.match(/.{2}/g)
  if (!pairs) return null
  const bytes = new Uint8Array(pairs.map((b) => parseInt(b, 16)))

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

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { config } from '@/lib/config'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    config.supabase.url,
    config.supabase.anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Called from a Server Component — safe to ignore
          }
        },
      },
    },
  )
}

/**
 * Service-role client — bypasses RLS. Use ONLY in server-side code
 * that requires elevated privileges (admin routes, webhooks, etc.)
 */
export function createServiceClient() {
  return createServerClient(
    config.supabase.url,
    config.supabase.serviceRoleKey,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    },
  )
}

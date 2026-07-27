import { createBrowserClient } from '@supabase/ssr'
import { publicConfig } from '@/lib/config.public'

export function createClient() {
  return createBrowserClient(publicConfig.supabase.url, publicConfig.supabase.anonKey)
}

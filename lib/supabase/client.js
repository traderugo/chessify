// lib/supabase/client.js
'use client'

import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a fresh Supabase client for client components
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

// Pastikan untuk menambahkan variabel lingkungan ini di file .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  ''

// Client untuk digunakan di server-side
export const createServerClient = () => {
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  })
}

// Client untuk digunakan di client-side
export const createClientClient = () => {
  return createBrowserClient(supabaseUrl, supabaseKey)
}
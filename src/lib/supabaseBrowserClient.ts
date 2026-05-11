import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseConfig } from './supabaseConfig'

const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig()

export const supabaseBrowserClient = createBrowserClient(supabaseUrl, supabaseAnonKey)

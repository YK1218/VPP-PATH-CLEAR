import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isSupabaseConfiguredValue = 
  !!supabaseUrl && 
  !!supabaseAnonKey && 
  !supabaseUrl.includes("example") && 
  !supabaseAnonKey.includes("example") &&
  !supabaseAnonKey.includes("dummy");

// Export a boolean indicating if Supabase is properly configured
export const isSupabaseConfigured = isSupabaseConfiguredValue;

// Create the Supabase client - uses dummy values if not configured
// The app will still work in demo/guest mode without real Supabase credentials
export const supabase = createClient(
  supabaseUrl || "https://example.supabase.co",
  supabaseAnonKey || "public-anon-key"
);

// Helper to check if we should use real Supabase auth vs demo mode
export function useRealSupabaseAuth(): boolean {
  return isSupabaseConfiguredValue;
}
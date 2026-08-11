import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a browser-compatible Supabase client.
 * For use strictly inside Client Components.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "[MINDSPACE] Error: Supabase credentials are not configured in your .env.local. Please copy .env.example to .env.local and fill in your Supabase project parameters."
    );
  }

  return createBrowserClient(url, anonKey);
}

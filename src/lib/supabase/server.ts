import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a server-compatible Supabase client.
 * Automatically handles cookie reading/writing.
 * For use inside Server Components, Server Actions, and Route Handlers.
 */
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "[MINDSPACE] Error: Supabase credentials are not configured in your .env.local. Please copy .env.example to .env.local and fill in your Supabase project parameters."
    );
  }

  const cookieStore = await cookies();

  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method can be called from a Server Component.
            // This can be ignored if middleware is handling user session refreshes.
          }
        },
      },
    }
  );
}

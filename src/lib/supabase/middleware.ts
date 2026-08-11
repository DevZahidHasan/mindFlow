import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Updates the user session using cookies and protects private route segments.
 * Redirects unauthenticated users trying to access '/w/*' to '/login'.
 */
export async function updateSession(request: NextRequest) {
  // Check if environment variables are configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn(
      "[MINDSPACE] Warning: Supabase environment credentials are not configured in your .env.local. Session protection is bypassed."
    );
    return NextResponse.next({
      request,
    });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session token using Supabase auth endpoint
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isWorkspacePath = request.nextUrl.pathname.startsWith("/w");
  const isAuthPath =
    request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup";

  // Route boundary redirects
  if (!user && isWorkspacePath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/w";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

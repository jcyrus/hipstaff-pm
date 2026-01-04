import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Route configuration for RBAC-based access control.
 * - `public`: Route is accessible without authentication
 * - `roles`: Array of roles that can access this route (empty = all authenticated users)
 */
interface RouteConfig {
  public?: boolean;
  roles?: string[];
}

/**
 * Route protection map.
 * Keys are route prefixes, values define access requirements.
 */
const ROUTE_CONFIG: Record<string, RouteConfig> = {
  // Public routes - no auth required
  "/login": { public: true },
  "/invite": { public: true },
  "/api/auth": { public: true },

  // Admin routes - superadmin/admin only
  "/admin": { roles: ["superadmin", "admin"] },

  // Manager+ routes
  "/users": { roles: ["superadmin", "admin", "manager"] },
};

/**
 * Check if a path matches a route config key.
 */
function matchRoute(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(route + "/");
}

/**
 * Get the route configuration for a given pathname.
 * Returns undefined if no specific config exists (defaults to auth required, any role).
 */
function getRouteConfig(pathname: string): RouteConfig | undefined {
  for (const [route, config] of Object.entries(ROUTE_CONFIG)) {
    if (matchRoute(pathname, route)) {
      return config;
    }
  }
  return undefined;
}

/**
 * Next.js Proxy for RBAC-based route protection.
 * 
 * This proxy:
 * 1. Allows public routes without authentication
 * 2. Redirects unauthenticated users to login
 * 3. Checks role-based access for protected routes
 * 4. Redirects authenticated users away from login page
 * 
 * Note: In Next.js 16+, `proxy.ts` replaces `middleware.ts`
 */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip static files and API routes that don't need auth
  // This is a safeguard in case the matcher doesn't work properly
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".") // Skip all files with extensions
  ) {
    // Exception: process API routes that need protection (not /api/auth)
    if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth")) {
      // Let API routes through - they handle their own auth
    } else if (pathname.startsWith("/api/auth")) {
      return NextResponse.next();
    } else {
      return NextResponse.next();
    }
  }

  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(
            cookiesToSet: { name: string; value: string; options: CookieOptions }[]
          ) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const routeConfig = getRouteConfig(pathname);

    // Public routes - allow without auth
    if (routeConfig?.public) {
      // For login page: only check auth if there are auth cookies present
      // This avoids expensive getUser() calls for new/logged-out users
      if (pathname === "/login") {
        const hasAuthCookies = request.cookies
          .getAll()
          .some((c) => c.name.startsWith("sb-"));
        
        if (hasAuthCookies) {
          const {
            data: { user },
            error,
          } = await supabase.auth.getUser();
          if (!error && user) {
            return NextResponse.redirect(new URL("/home", request.url));
          }
        }
      }
      return supabaseResponse;
    }

    // All other routes require authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // If there's an auth error or no user, redirect to login
    if (authError || !user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check role-based access if route requires specific roles
    if (routeConfig?.roles && routeConfig.roles.length > 0) {
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("supabase_user_id", user.id)
        .single();

      const userRole = userData?.role?.toLowerCase();

      if (!userRole || !routeConfig.roles.includes(userRole)) {
        // User doesn't have required role - redirect to home
        return NextResponse.redirect(new URL("/home", request.url));
      }
    }

    return supabaseResponse;
  } catch (error) {
    console.error("[Proxy] Unexpected error:", error);
    // On error, redirect to login as a safety measure
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - Any files with extensions (images, js, css, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)",
  ],
};

import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

interface RouteConfig {
  public?: boolean;
  roles?: string[];
}

const ROUTE_CONFIG: Record<string, RouteConfig> = {
  "/login": { public: true },
  "/invite": { public: true },
  "/api/auth": { public: true },
  "/admin": { roles: ["superadmin", "admin"] },
  "/users": { roles: ["superadmin", "admin", "manager"] },
};

function matchRoute(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(route + "/");
}

function getRouteConfig(pathname: string): RouteConfig | undefined {
  for (const [route, config] of Object.entries(ROUTE_CONFIG)) {
    if (matchRoute(pathname, route)) return config;
  }
  return undefined;
}

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const pathname = nextUrl.pathname;
  const routeConfig = getRouteConfig(pathname);

  // Public route: allow through, but redirect authenticated users away from /login
  if (routeConfig?.public) {
    if (pathname === "/login" && session?.user) {
      return NextResponse.redirect(new URL("/home", req.url));
    }
    return NextResponse.next();
  }

  // Unauthenticated: redirect to login
  if (!session?.user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-gated route: read role from JWT claim (embedded at login)
  if (routeConfig?.roles && routeConfig.roles.length > 0) {
    const role = ((session.user as { role?: string }).role ?? "member").toLowerCase();
    if (!routeConfig.roles.includes(role)) {
      return NextResponse.redirect(new URL("/home", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)",
  ],
};

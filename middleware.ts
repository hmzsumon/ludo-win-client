import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const publicRoutes: string[] = ["/", "/about", "/contact"];

const commonRoutes: string[] = ["/shop", "/products", "/blog", "/courses"];

const authRoutes: string[] = [
  "/login",
  "/register-login",
  "/register",
  "/verify-otp",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/verify-otp-password",
];

const publicRoutePrefixes: string[] = [];
const commonRoutePrefixes: string[] = ["/products", "/blog", "/courses"];
const authRoutePrefixes: string[] = [];

const PUBLIC_FILE =
  /\.(?:png|jpe?g|gif|webp|svg|ico|bmp|avif|mp3|wav|ogg|mp4|webm|txt|xml|json|js|css|map|woff2?|ttf|eot)$/i;

function matchesRoute(
  pathname: string,
  routes: string[],
  prefixes: string[] = [],
): boolean {
  if (routes.includes(pathname)) return true;

  return prefixes.some((prefix) => {
    if (pathname === prefix) return true;
    return pathname.startsWith(`${prefix}/`);
  });
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("sw99_token")?.value;
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/api") || request.method === "OPTIONS") {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/_next/image") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/icons") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.endsWith(".webmanifest") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const isPublicRoute = matchesRoute(
    pathname,
    publicRoutes,
    publicRoutePrefixes,
  );

  const isCommonRoute = matchesRoute(
    pathname,
    commonRoutes,
    commonRoutePrefixes,
  );

  const isAuthRoute = matchesRoute(pathname, authRoutes, authRoutePrefixes);

  const isOpenRoute = isPublicRoute || isCommonRoute || isAuthRoute;

  if (!token && !isOpenRoute) {
    if (request.method !== "GET") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    // loginUrl.search = "";
    // loginUrl.searchParams.set("tab", "signin");
    // loginUrl.searchParams.set("next", `${pathname}${search}`);

    return NextResponse.redirect(loginUrl, 303);
  }

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url), 303);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|.*\\..*).*)",
  ],
};

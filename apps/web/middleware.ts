import { NextResponse, type NextRequest } from "next/server";

const DEFAULT_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "linkforge.com",
  "www.linkforge.com",
  "linkforge.app",
  "www.linkforge.app",
  "linkforge.dev",
  "www.linkforge.dev",
]);

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostHeader = request.headers.get("host") || "";
  const hostname = hostHeader.split(":")[0].toLowerCase().trim();

  // Bypass static files, internal Next.js paths, and direct API calls
  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/static") ||
    url.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if current hostname is standard platform domain
  const isDefaultDomain =
    DEFAULT_HOSTS.has(hostname) ||
    hostname.endsWith(".vercel.app") ||
    hostname.endsWith(".render.com") ||
    hostname.endsWith(".onrender.com");

  if (isDefaultDomain) {
    return NextResponse.next();
  }

  // Custom apex or subdomain detected: resolve mapped user profile
  const backendUrl =
    process.env.BACKEND_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:5000";

  try {
    const res = await fetch(`${backendUrl}/api/v1/domains/resolve/${hostname}`, {
      next: { revalidate: 120 },
      headers: {
        "x-forwarded-host": hostname,
      },
    });

    if (res.ok) {
      const data = await res.json();
      const username = data?.data?.username;

      if (username) {
        if (url.pathname === "/" || url.pathname === "") {
          url.pathname = `/username/${username}`;
        } else if (url.pathname.startsWith("/r/")) {
          // Preserve redirect links e.g. creator.com/r/xyz
        } else if (!url.pathname.startsWith(`/username/${username}`)) {
          url.pathname = `/username/${username}${url.pathname}`;
        }

        const response = NextResponse.rewrite(url);
        response.headers.set("x-custom-domain", hostname);
        response.headers.set("x-domain-owner", username);
        return response;
      }
    }
  } catch (err) {
    console.error(`[Middleware] Error resolving custom domain "${hostname}":`, err);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

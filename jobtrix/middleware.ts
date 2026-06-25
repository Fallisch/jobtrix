import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { routing } from "./i18n/routing";
import { buildCspHeader } from "@/lib/security-headers";

const intlMiddleware = createMiddleware(routing);

const protectedPaths = ["/profile", "/generate", "/application-history", "/onboarding"];

const publicPaths = ["/", "/impressum", "/datenschutz", "/agb", "/hilfe", "/pricing"];

function getLocaleAndPath(pathname: string): { locale: string; path: string } {
  const segments = pathname.split("/").filter(Boolean);
  const [first, ...rest] = segments;
  if ((routing.locales as readonly string[]).includes(first)) {
    return { locale: first, path: `/${rest.join("/")}` };
  }
  return { locale: routing.defaultLocale, path: `/${segments.join("/")}` };
}

function isProtectedPath(path: string): boolean {
  return protectedPaths.some((p) => path === p || path.startsWith(`${p}/`));
}

function isPublicPath(path: string): boolean {
  return publicPaths.some((p) => path === p);
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { locale, path } = getLocaleAndPath(pathname);

  if (process.env.MAINTENANCE_MODE === "true" && !isPublicPath(path)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}`;
    return NextResponse.redirect(url);
  }

  if (isProtectedPath(path)) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/login`;
      return NextResponse.redirect(url);
    }
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCspHeader(nonce);

  const intlResponse = intlMiddleware(request);

  if (intlResponse.headers.has("location")) {
    return intlResponse;
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("content-security-policy", csp);

  const rewriteUrl = intlResponse.headers.get("x-middleware-rewrite");

  const response = rewriteUrl
    ? NextResponse.rewrite(new URL(rewriteUrl), { request: { headers: requestHeaders } })
    : NextResponse.next({ request: { headers: requestHeaders } });

  for (const cookie of intlResponse.cookies.getAll()) {
    response.cookies.set(cookie.name, cookie.value);
  }

  response.headers.set("content-security-policy", csp);

  return response;
}

export const config = {
  matcher: ["/((?!_next|_vercel|api|.*\\..*).*)"],
};

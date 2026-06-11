import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const protectedPaths = ["/profile", "/generate", "/application-history"];

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

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { locale, path } = getLocaleAndPath(pathname);

  if (isProtectedPath(path)) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/login`;
      return NextResponse.redirect(url);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next|_vercel|api|.*\\..*).*)"],
};

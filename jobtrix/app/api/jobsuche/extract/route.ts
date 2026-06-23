import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { isHttpUrl, isSafeExternalUrl } from "@/lib/url-safety";
import { extractReadableText, hasEnoughText } from "@/lib/extract-text";

export const runtime = "nodejs";

const FETCH_TIMEOUT_MS = 15_000;
const MAX_BYTES = 3_000_000;

function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!(await checkRateLimit(`jobsuche-extract:${session.user.id}`, 30))) {
    return NextResponse.json({ error: "tooManyRequests" }, { status: 429 });
  }

  let url = "";
  try {
    const body = await request.json();
    url = typeof body?.url === "string" ? body.url : "";
  } catch {
    url = "";
  }

  if (!isHttpUrl(url)) {
    return NextResponse.json({ error: "invalidUrl" }, { status: 400 });
  }

  // SSRF-Schutz: interne/Loopback/Link-Local-Ziele werden nie abgerufen.
  // Bewusst kein Fehler, sondern text:null → der Client zeigt den Einfüge-Fallback.
  if (!(await isSafeExternalUrl(url))) {
    return NextResponse.json({ text: null });
  }

  try {
    const res = await fetchWithTimeout(url, {
      // Bewusst nur generische Header: keine Cookies/Authorization/internen Header.
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; JobtrixBot/1.0; +https://jobtrix.app)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "manual",
    });

    // Redirects nicht automatisch folgen (Redirect-basiertes SSRF-Bypass vermeiden).
    if (!res.ok) {
      return NextResponse.json({ text: null });
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (contentType && !/text\/html|application\/xhtml/i.test(contentType)) {
      return NextResponse.json({ text: null });
    }

    const contentLength = Number(res.headers.get("content-length") ?? "0");
    if (contentLength && contentLength > MAX_BYTES) {
      return NextResponse.json({ text: null });
    }

    const html = await res.text();
    const text = extractReadableText(html);
    if (!hasEnoughText(text)) {
      return NextResponse.json({ text: null });
    }

    return NextResponse.json({ text });
  } catch {
    // Timeout/Netzwerkfehler → verständlicher Fallback statt 500.
    return NextResponse.json({ text: null });
  }
}

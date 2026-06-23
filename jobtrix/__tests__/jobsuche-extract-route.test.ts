/**
 * @jest-environment node
 */
import { POST } from "@/app/api/jobsuche/extract/route";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { checkRateLimit } from "@/lib/rate-limit";
import { isHttpUrl, isSafeExternalUrl } from "@/lib/url-safety";

jest.mock("next-auth/next", () => ({ getServerSession: jest.fn() }));
jest.mock("@/lib/auth", () => ({ authOptions: {} }));
jest.mock("@/lib/rate-limit", () => ({ checkRateLimit: jest.fn() }));
jest.mock("@/lib/url-safety", () => ({
  isHttpUrl: jest.fn(),
  isSafeExternalUrl: jest.fn(),
}));

const mockSession = getServerSession as jest.Mock;
const mockRateLimit = checkRateLimit as jest.Mock;
const mockIsHttpUrl = isHttpUrl as jest.Mock;
const mockIsSafe = isSafeExternalUrl as jest.Mock;
const mockFetch = jest.fn();
global.fetch = mockFetch;

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/jobsuche/extract", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

function htmlResponse(text: string, contentType = "text/html") {
  return {
    ok: true,
    status: 200,
    headers: { get: (k: string) => (k.toLowerCase() === "content-type" ? contentType : null) },
    text: () => Promise.resolve(text),
  };
}

beforeEach(() => {
  mockSession.mockResolvedValue({ user: { id: "user-1" } });
  mockRateLimit.mockResolvedValue(true);
  mockIsHttpUrl.mockReturnValue(true);
  mockIsSafe.mockResolvedValue(true);
  mockFetch.mockReset();
});

describe("POST /api/jobsuche/extract", () => {
  it("antwortet 401 ohne Session", async () => {
    mockSession.mockResolvedValue(null);
    const res = await POST(makeRequest({ url: "https://example.com/job/1" }));
    expect(res.status).toBe(401);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("antwortet 429 wenn das Rate-Limit greift", async () => {
    mockRateLimit.mockResolvedValue(false);
    const res = await POST(makeRequest({ url: "https://example.com/job/1" }));
    expect(res.status).toBe(429);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("antwortet 400 für nicht-http(s)-URLs und ruft die Seite nicht ab", async () => {
    mockIsHttpUrl.mockReturnValue(false);
    const res = await POST(makeRequest({ url: "ftp://example.com" }));
    expect(res.status).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("ruft interne/Link-Local-Ziele nicht ab und liefert kein 500 (text:null)", async () => {
    mockIsSafe.mockResolvedValue(false);
    const res = await POST(makeRequest({ url: "http://169.254.169.254/latest/meta-data" }));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ text: null });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("extrahiert den lesbaren Text bei Erfolg", async () => {
    const body = "<html><body><p>" + "Wir suchen Sie. ".repeat(20) + "</p></body></html>";
    mockFetch.mockResolvedValue(htmlResponse(body));
    const res = await POST(makeRequest({ url: "https://example.com/job/1" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.text).toContain("Wir suchen Sie.");
  });

  it("gibt keine internen Header (Cookie/Authorization) an die externe Seite weiter", async () => {
    mockFetch.mockResolvedValue(htmlResponse("<p>" + "x ".repeat(200) + "</p>"));
    await POST(makeRequest({ url: "https://example.com/job/1" }));
    const headers = (mockFetch.mock.calls[0][1]?.headers ?? {}) as Record<string, string>;
    const keys = Object.keys(headers).map((k) => k.toLowerCase());
    expect(keys).not.toContain("cookie");
    expect(keys).not.toContain("authorization");
  });

  it("liefert text:null statt 500 bei Abruf-Fehler/Timeout", async () => {
    mockFetch.mockRejectedValue(new Error("aborted"));
    const res = await POST(makeRequest({ url: "https://example.com/job/1" }));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ text: null });
  });

  it("liefert text:null bei zu wenig extrahiertem Text", async () => {
    mockFetch.mockResolvedValue(htmlResponse("<p>kurz</p>"));
    const res = await POST(makeRequest({ url: "https://example.com/job/1" }));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ text: null });
  });

  it("liefert text:null bei Nicht-HTML-Antworten", async () => {
    mockFetch.mockResolvedValue(htmlResponse("%PDF-1.4 ...", "application/pdf"));
    const res = await POST(makeRequest({ url: "https://example.com/job/1.pdf" }));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ text: null });
  });
});

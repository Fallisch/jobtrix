/**
 * @jest-environment node
 */
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import middleware from "@/middleware";
import { getToken } from "next-auth/jwt";

if (!globalThis.crypto?.randomUUID) {
  Object.defineProperty(globalThis, "crypto", {
    value: { ...globalThis.crypto, randomUUID },
  });
}

jest.mock("next-auth/jwt", () => ({
  getToken: jest.fn(),
}));

jest.mock("next-intl/middleware", () => ({
  __esModule: true,
  default: () => () => {
    const res = NextResponse.next();
    return res;
  },
}));

jest.mock("@/lib/security-headers", () => ({
  buildCspHeader: (nonce?: string) => `default-src 'self'; script-src 'self' 'nonce-${nonce}'`,
}));

jest.mock("@/i18n/routing", () => ({
  routing: { locales: ["de", "en"], defaultLocale: "de" },
}));

const mockedGetToken = jest.mocked(getToken);

function makeRequest(path: string) {
  return new NextRequest(new URL(path, "http://localhost:3000"));
}

describe("middleware Route-Schutz", () => {
  beforeEach(() => {
    mockedGetToken.mockReset();
  });

  it("leitet bei /de/profile ohne Session zu /de/login weiter", async () => {
    mockedGetToken.mockResolvedValue(null);
    const res = await middleware(makeRequest("/de/profile"));
    expect(res.headers.get("location")).toBe("http://localhost:3000/de/login");
  });

  it("leitet bei /en/generate ohne Session zu /en/login weiter", async () => {
    mockedGetToken.mockResolvedValue(null);
    const res = await middleware(makeRequest("/en/generate"));
    expect(res.headers.get("location")).toBe("http://localhost:3000/en/login");
  });

  it("leitet bei /de/application-history ohne Session zu /de/login weiter", async () => {
    mockedGetToken.mockResolvedValue(null);
    const res = await middleware(makeRequest("/de/application-history"));
    expect(res.headers.get("location")).toBe("http://localhost:3000/de/login");
  });

  it("lässt /de/profile mit gültiger Session durch", async () => {
    mockedGetToken.mockResolvedValue({ id: "user-1" });
    const res = await middleware(makeRequest("/de/profile"));
    expect(res.headers.get("location")).toBeFalsy();
  });

  it("lässt /de/login ohne Session durch", async () => {
    mockedGetToken.mockResolvedValue(null);
    const res = await middleware(makeRequest("/de/login"));
    expect(res.headers.get("location")).toBeFalsy();
  });

  it("lässt /de/impressum ohne Session durch", async () => {
    mockedGetToken.mockResolvedValue(null);
    const res = await middleware(makeRequest("/de/impressum"));
    expect(res.headers.get("location")).toBeFalsy();
  });

  it("lässt /de/datenschutz ohne Session durch", async () => {
    mockedGetToken.mockResolvedValue(null);
    const res = await middleware(makeRequest("/de/datenschutz"));
    expect(res.headers.get("location")).toBeFalsy();
  });

  it("lässt /de/agb ohne Session durch", async () => {
    mockedGetToken.mockResolvedValue(null);
    const res = await middleware(makeRequest("/de/agb"));
    expect(res.headers.get("location")).toBeFalsy();
  });

  it("lässt /de/hilfe ohne Session durch", async () => {
    mockedGetToken.mockResolvedValue(null);
    const res = await middleware(makeRequest("/de/hilfe"));
    expect(res.headers.get("location")).toBeFalsy();
  });
});

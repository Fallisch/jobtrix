/**
 * @jest-environment node
 */
import { SECURITY_HEADERS, buildCspHeader } from "@/lib/security-headers";

function header(key: string) {
  return SECURITY_HEADERS.find((h) => h.key === key)?.value ?? null;
}

describe("HTTP-Security-Header", () => {
  it("setzt X-Frame-Options: DENY", () => {
    expect(header("X-Frame-Options")).toBe("DENY");
  });

  it("setzt X-Content-Type-Options: nosniff", () => {
    expect(header("X-Content-Type-Options")).toBe("nosniff");
  });

  it("setzt Referrer-Policy: strict-origin-when-cross-origin", () => {
    expect(header("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
  });

  it("setzt Strict-Transport-Security", () => {
    const value = header("Strict-Transport-Security");
    expect(value).not.toBeNull();
    expect(value).toContain("max-age=");
  });
});

describe("buildCspHeader", () => {
  it("enthält default-src", () => {
    const csp = buildCspHeader();
    expect(csp).toContain("default-src");
  });

  it("erlaubt Google Fonts", () => {
    const csp = buildCspHeader();
    expect(csp).toContain("fonts.googleapis.com");
    expect(csp).toContain("fonts.gstatic.com");
  });

  it("erlaubt Stripe-Checkout-Redirect", () => {
    const csp = buildCspHeader();
    expect(csp).toContain("checkout.stripe.com");
  });

  it("erlaubt Service-Worker über worker-src", () => {
    const csp = buildCspHeader();
    expect(csp).toContain("worker-src");
  });

  it("erlaubt blob:-Iframes in frame-src für PDF-Vorschau", () => {
    const csp = buildCspHeader();
    expect(csp).toMatch(/frame-src[^;]*blob:/);
  });

  it("behält Stripe-Checkout in frame-src nach blob:-Erweiterung", () => {
    const csp = buildCspHeader();
    expect(csp).toMatch(/frame-src[^;]*checkout\.stripe\.com/);
  });

  it("enthält unsafe-inline ohne Nonce (Fallback)", () => {
    const csp = buildCspHeader();
    expect(csp).toMatch(/script-src[^;]*'unsafe-inline'/);
  });

  it("enthält Nonce wenn übergeben", () => {
    const csp = buildCspHeader("testNonce123");
    expect(csp).toContain("'nonce-testNonce123'");
  });

  it("enthält unsafe-inline zusammen mit Nonce (Browser-Fallback)", () => {
    const csp = buildCspHeader("testNonce123");
    expect(csp).toMatch(/script-src[^;]*'nonce-testNonce123'/);
    expect(csp).toMatch(/script-src[^;]*'unsafe-inline'/);
  });
});

/**
 * @jest-environment node
 */
import { SECURITY_HEADERS } from "@/lib/security-headers";

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

  it("setzt Content-Security-Policy", () => {
    const csp = header("Content-Security-Policy");
    expect(csp).not.toBeNull();
    expect(csp).toContain("default-src");
  });

  it("erlaubt Google Fonts in der CSP", () => {
    const csp = header("Content-Security-Policy")!;
    expect(csp).toContain("fonts.googleapis.com");
    expect(csp).toContain("fonts.gstatic.com");
  });

  it("erlaubt Stripe-Checkout-Redirect in der CSP", () => {
    const csp = header("Content-Security-Policy")!;
    expect(csp).toContain("checkout.stripe.com");
  });

  it("erlaubt Service-Worker über worker-src in der CSP", () => {
    const csp = header("Content-Security-Policy")!;
    expect(csp).toContain("worker-src");
  });
});

export type SecurityHeader = { key: string; value: string };

export function buildCspHeader(nonce?: string): string {
  const scriptSrc = nonce
    ? `'self' 'nonce-${nonce}' 'unsafe-inline' 'wasm-unsafe-eval' https://static.cloudflareinsights.com`
    : `'self' 'unsafe-inline' 'wasm-unsafe-eval' https://static.cloudflareinsights.com`;

  const directives: Record<string, string> = {
    "default-src": "'self'",
    "script-src": scriptSrc,
    "style-src": "'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src": "'self' https://fonts.gstatic.com",
    "img-src": "'self' data: blob:",
    "connect-src": "'self' data: https://cloudflareinsights.com",
    "frame-src": "https://checkout.stripe.com blob:",
    "worker-src": "'self' blob:",
    "frame-ancestors": "'none'",
    "form-action": "'self'",
    "base-uri": "'self'",
  };

  return Object.entries(directives)
    .map(([directive, value]) => `${directive} ${value}`)
    .join("; ");
}

export const SECURITY_HEADERS: SecurityHeader[] = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

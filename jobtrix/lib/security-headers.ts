export type SecurityHeader = { key: string; value: string };

const CSP_DIRECTIVES: Record<string, string> = {
  "default-src": "'self'",
  "script-src": "'self' 'unsafe-inline'",
  "style-src": "'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src": "'self' https://fonts.gstatic.com",
  "img-src": "'self' data: blob:",
  "connect-src": "'self'",
  "frame-src": "https://checkout.stripe.com",
  "worker-src": "'self' blob:",
  "frame-ancestors": "'none'",
  "form-action": "'self'",
  "base-uri": "'self'",
};

const csp = Object.entries(CSP_DIRECTIVES)
  .map(([directive, value]) => `${directive} ${value}`)
  .join("; ");

export const SECURITY_HEADERS: SecurityHeader[] = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Content-Security-Policy", value: csp },
];

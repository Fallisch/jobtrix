import withPWA from "@ducanh2912/next-pwa";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

// CSP wird dynamisch mit Nonce in middleware.ts gesetzt.
// Hier nur die nicht-CSP Security-Headers, die für alle Routen gelten.
const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    MAINTENANCE_MODE: process.env.MAINTENANCE_MODE || "false",
  },
  async headers() {
    return [{ source: "/(.*)", headers: SECURITY_HEADERS }];
  },
};

export default withNextIntl(
  withPWA({
    dest: "public",
    cacheOnFrontEndNav: true,
    aggressiveFrontEndNavCaching: false,
    reloadOnOnline: true,
    disable: process.env.NODE_ENV === "development",
    extendDefaultRuntimeCaching: true,
    workboxOptions: {
      runtimeCaching: [
        {
          urlPattern: /^https?:\/\/.*\/api\/auth\/.*/i,
          handler: "NetworkOnly",
        },
      ],
    },
  })(nextConfig)
);

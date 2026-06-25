import type { ReactNode } from "react";
import { headers } from "next/headers";
import { Inter } from "next/font/google";
import ThemeProvider from "@/components/ThemeProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default async function RootLayout({ children }: { children: ReactNode }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html suppressHydrationWarning className={inter.variable}>
      <body className="bg-background text-text font-sans antialiased min-h-screen flex flex-col">
        <ThemeProvider nonce={nonce}>{children}</ThemeProvider>
      </body>
    </html>
  );
}

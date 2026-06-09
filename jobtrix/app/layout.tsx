import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html suppressHydrationWarning className={inter.variable}>
      <body className="bg-background text-text font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}

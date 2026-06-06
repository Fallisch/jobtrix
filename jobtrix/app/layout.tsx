import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import InstallBanner from "@/components/InstallBanner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "JobTRIX",
  description: "Bewerbungen professionell erstellen und versenden",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "JobTRIX",
  },
};

export const viewport: Viewport = {
  themeColor: "#1E3A5F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={inter.variable}>
      <body className="bg-background text-text font-sans antialiased min-h-screen">
        <Header />
        <main>{children}</main>
        <InstallBanner />
      </body>
    </html>
  );
}

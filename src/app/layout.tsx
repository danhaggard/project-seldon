import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { SidebarContent } from "@/components/layout/sidebar";
import { Suspense } from "react";
import { AuthButton, AuthButtonSkeleton } from "@/components/auth/auth-button";
import { Toaster } from "@/components/ui/sonner";
import { MobileSheet } from "@/components/layout/mobile-sheet";

import "./globals.css";
import Link from "next/link";
import { routes } from "@/config/routes";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Project Seldon",
  description: "Project Seldon",
};

export default function RootLayout({
  children,
  authModal,
}: Readonly<{
  children: React.ReactNode;
  authModal: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-[100dvh] flex flex-col bg-background`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* GLOBAL HEADER */}
          <header className="sticky top-0 z-50 w-full h-14 border-b bg-background/95 backdrop-blur flex items-center">
            <div className="max-w-7xl mx-auto flex w-full items-center gap-4 px-4">
              {/* Mobile Hamburger */}
              <div className="lg:hidden">
                <MobileSheet>
                  <SidebarContent />
                </MobileSheet>
              </div>
              <Link href={routes.home}>
                <div className="font-bold text-xl tracking-tighter">
                  PROJECT SELDON
                </div>
              </Link>

              <div className="flex-1" />

              <Suspense fallback={<AuthButtonSkeleton />}>
                <AuthButton />
              </Suspense>
            </div>
          </header>

          {/* DYNAMIC CONTENT AREA */}
          <div className="flex-1 flex flex-col">{children}</div>

          {authModal}

          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

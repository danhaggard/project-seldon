import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { SidebarContent } from "@/components/layout/sidebar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import { AuthButton, AuthButtonSkeleton } from "@/components/auth/auth-button";
import { Toaster } from "@/components/ui/sonner";
import { MobileSheet } from "@/components/layout/mobile-sheet";

import "./globals.css";

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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            {/* HEADER */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
              <div className="max-w-360 mx-auto flex h-14 items-center gap-4 px-4">
                {/* Mobile Hamburger (Visible only on small screens) */}
                <div className="lg:hidden">
                  <MobileSheet>
                    <SidebarContent />
                  </MobileSheet>
                </div>

                <div className="font-bold text-xl tracking-tighter">
                  PROJECT SELDON
                </div>

                <div className="flex-1" />

                <Suspense fallback={<AuthButtonSkeleton />}>
                  <AuthButton />
                </Suspense>
              </div>
            </header>

            {/* MAIN CONTENT GRID */}
            {/* We use max-w-7xl (or 1440px) to mimic the "Reddit center-aligned" look */}
            <div className="flex-1 max-w-360 mx-auto w-full px-4 grid grid-cols-1 lg:grid-cols-[240px_1fr] xl:grid-cols-[240px_1fr_300px] gap-6">
              {/* Left Sidebar (Desktop) */}
              <aside className="hidden lg:block border-r py-6 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
                <SidebarContent />
              </aside>

              {/* Main Feed Area */}
              <main className="py-6 min-w-0">{children}</main>
              <Toaster />

              {/* Right Sidebar (Desktop XL only) */}
              <aside className="hidden xl:block py-6 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
                <div className="rounded-lg border bg-card p-4">
                  <h3 className="font-semibold mb-2 text-sm uppercase text-muted-foreground tracking-wider">
                    About Seldon
                  </h3>
                  <p className="text-sm leading-relaxed">
                    Quantifying the accuracy of public predictions using game
                    theory and historical data.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";

import { ClerkProvider } from '@clerk/nextjs'
import ConvexClientProvider from '@/components/ConvexClientProvider'


const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const firaCode = Fira_Code({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FitTrack Pro - Premium Gym Workout Tracker",
  description: "Transform your training with structured 4-week workout plans, progressive overload tracking, and comprehensive exercise library.",
  keywords: ["gym", "workout", "fitness", "training", "exercise", "strength"],
  authors: [{ name: "FitTrack Pro" }],
  openGraph: {
    title: "FitTrack Pro - Premium Gym Workout Tracker",
    description: "Transform your training with structured 4-week workout plans",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${firaCode.variable} font-sans antialiased overscroll-none`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <QueryProvider>
            <ClerkProvider>
              <ConvexClientProvider>
                {children}
                <Toaster 
                  position="top-right"
                  toastOptions={{
                    style: {
                      background: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      color: 'hsl(var(--foreground))',
                    },
                  }}
                />
              </ConvexClientProvider>
            </ClerkProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

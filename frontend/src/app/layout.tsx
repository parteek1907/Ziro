import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import { ErrorSuppressor } from "@/components/ui/ErrorSuppressor";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ziro | AI for Good",
  description: "AI-driven, zero-bandwidth, zero-knowledge financial platform.",
};

import { PerformanceProvider } from "@/components/PerformanceProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased min-h-screen flex flex-col bg-white">
        <ErrorSuppressor />
        <PerformanceProvider>
          <AuthProvider>
            <main className="flex-grow">{children}</main>
          </AuthProvider>
        </PerformanceProvider>
      </body>
    </html>
  );
}

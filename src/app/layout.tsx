import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Carwaj",
  description: "Car cleaning schedule and operations manager",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const isPreview = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("vntkpetoickfmmhsnuea");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${hankenGrotesk.variable} ${jetBrainsMono.variable}`}>
      <body className="bg-canvas text-ink antialiased font-sans">
        {isPreview && (
          <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 bg-amber-950/90 text-amber-300 text-[11px] font-mono font-semibold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm pointer-events-none select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            DEV · {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ?? "local"}
          </div>
        )}
        {children}
        <Analytics />
      </body>
    </html>
  );
}

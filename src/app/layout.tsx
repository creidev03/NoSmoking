import type { Metadata } from "next";
import { Geist, Lora, Poppins } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
});
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });

export const metadata: Metadata = {
  title: "No Smoking",
  description: "Gamified app for quitting smoking",
};

/**
 * Root layout — thin shell with fonts and HTML structure.
 * Locale providers (ClerkProvider, NextIntlClientProvider) live in
 * `src/app/[locale]/layout.tsx`. The middleware redirects bare paths
 * to /es, so users always land on a locale-prefixed route.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={cn("font-sans", geist.variable, poppins.variable, lora.variable)} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { ClerkProvider, esMX } from "@clerk/nextjs";
import "./globals.css";
import { Geist, Lora, Poppins } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Toaster } from "sonner";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-poppins" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });

export const metadata: Metadata = {
  title: "No Smoking",
  description: "Gamified app for quitting smoking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      afterSignOutUrl="/"
      localization={esMX}
    >
      <html lang="es" className={cn("font-sans", geist.variable, poppins.variable, lora.variable)} suppressHydrationWarning>
        <body>
          <header className="fixed top-4 right-4 z-50">
            <ThemeToggle />
          </header>
          {children}
          <Toaster richColors position="top-center" />
        </body>
      </html>
    </ClerkProvider>
  );
}

import { ClerkProvider } from "@clerk/nextjs";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Toaster } from "sonner";
import { Geist, Lora, Poppins } from "next/font/google";
import { cn } from "@/lib/utils";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import "../globals.css";

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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <ClerkProvider afterSignOutUrl={`/${locale}`}>
      <html
        lang={locale}
        className={cn(
          "font-sans",
          geist.variable,
          poppins.variable,
          lora.variable
        )}
        suppressHydrationWarning
      >
        <body>
          <NextIntlClientProvider messages={messages}>
            <header className="fixed top-4 right-4 z-50">
              <ThemeToggle />
            </header>
            {children}
            <Toaster richColors position="top-center" />
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

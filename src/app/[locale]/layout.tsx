import { ClerkProvider } from "@clerk/nextjs";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Toaster } from "sonner";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <ClerkProvider afterSignOutUrl="/">
      <NextIntlClientProvider locale={locale} messages={messages}>
        <header className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </header>
        {children}
        <Toaster richColors position="top-center" />
      </NextIntlClientProvider>
    </ClerkProvider>
  );
}

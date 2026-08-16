"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const next = locale === "es" ? "en" : "es";
    router.replace(pathname, { locale: next });
  };

  return (
    <button
      data-language-toggle
      onClick={toggleLocale}
      className="inline-flex min-h-12 items-center justify-center rounded-md px-2.5 text-sm font-semibold transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={locale === "es" ? "Switch to English" : "Cambiar a español"}
    >
      {locale === "es" ? "🇺🇸 EN" : "🇪🇸 ES"}
    </button>
  );
}

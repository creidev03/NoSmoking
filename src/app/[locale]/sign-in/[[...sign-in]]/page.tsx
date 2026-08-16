"use client";

import { SignIn } from "@clerk/nextjs";
import { useClerkTheme } from "@/components/ui/use-clerk-theme";
import Link from "next/link";
import { useLocale } from "next-intl";

export default function SignInPage() {
  const appearance = useClerkTheme();
  const locale = useLocale();
  const otherLocale = locale === "es" ? "en" : "es";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <SignIn appearance={appearance} routing="hash" />

        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link
            href={`/${otherLocale}/sign-in`}
            className="text-primary hover:text-primary/80 transition-colors"
          >
            {otherLocale === "es" ? "Versión en español" : "English version"}
          </Link>
        </p>
      </div>
    </div>
  );
}

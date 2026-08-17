"use client";

import { SignUp } from "@clerk/nextjs";
import { useClerkTheme } from "@/components/ui/use-clerk-theme";
import Link from "next/link";
import { useLocale } from "next-intl";

export default function SignUpPage() {
  const appearance = useClerkTheme();
  const locale = useLocale();
  const otherLocale = locale === "es" ? "en" : "es";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <SignUp
          appearance={appearance}
          routing="hash"
          forceRedirectUrl={`/${locale}/onboarding`}
        />

        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link
            href={`/${otherLocale}/sign-up`}
            className="text-primary hover:text-primary/80 transition-colors"
          >
            {otherLocale === "es" ? "Versión en español" : "English version"}
          </Link>
        </p>
      </div>
    </div>
  );
}

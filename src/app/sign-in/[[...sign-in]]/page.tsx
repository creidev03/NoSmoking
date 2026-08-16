"use client";

import { SignIn } from "@clerk/nextjs";
import { useClerkTheme } from "@/components/ui/use-clerk-theme";
import Link from "next/link";

export default function SignInPage() {
  const appearance = useClerkTheme();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <SignIn appearance={appearance} routing="hash" />

        {/* Language toggle */}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link
            href="/sign-in/en"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            English version
          </Link>
        </p>
      </div>
    </div>
  );
}

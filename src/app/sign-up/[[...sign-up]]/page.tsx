"use client";

import { SignUp } from "@clerk/nextjs";
import { useClerkTheme } from "@/components/ui/use-clerk-theme";
import Link from "next/link";

export default function SignUpPage() {
  const appearance = useClerkTheme();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <SignUp appearance={appearance} routing="hash" />

        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link
            href="/es/sign-up"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            Versión en español
          </Link>
        </p>
      </div>
    </div>
  );
}

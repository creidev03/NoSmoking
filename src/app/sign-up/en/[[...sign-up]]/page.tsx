"use client";

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function EnglishSignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <SignUp routing="hash" />

        {/* Language toggle */}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link
            href="/sign-up"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            Versión en español
          </Link>
        </p>
      </div>
    </div>
  );
}

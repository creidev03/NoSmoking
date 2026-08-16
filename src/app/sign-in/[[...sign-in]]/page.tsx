"use client";

import { SignIn } from "@clerk/nextjs";
import { useClerkTheme } from "@/components/ui/use-clerk-theme";

export default function SignInPage() {
  const appearance = useClerkTheme();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SignIn appearance={appearance} routing="hash" />
    </div>
  );
}

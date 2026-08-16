"use client";

import { SignUp } from "@clerk/nextjs";
import { useClerkTheme } from "@/components/ui/use-clerk-theme";

export default function SignUpPage() {
  const appearance = useClerkTheme();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SignUp appearance={appearance} routing="hash" />
    </div>
  );
}

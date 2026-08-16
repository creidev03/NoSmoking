import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "../../../globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "No Smoking — Sign Up",
};

export default function EnglishSignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}

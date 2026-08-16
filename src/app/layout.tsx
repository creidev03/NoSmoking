import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "No Smoking",
  description: "Gamified app for quitting smoking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "No Smoking",
  description: "Gamified app for quitting smoking",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

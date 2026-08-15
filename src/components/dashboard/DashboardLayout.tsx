"use client";

import { DashboardNav } from "./DashboardNav";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <DashboardNav />
      <main className="flex-1 pb-20 md:pb-0 md:ml-64">
        {children}
      </main>
    </div>
  );
}

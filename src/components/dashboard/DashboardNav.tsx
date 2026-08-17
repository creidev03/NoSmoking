"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { Home, Trophy, BarChart3, Settings } from "lucide-react";

export function DashboardNav() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("nav");

  const navItems = [
    { href: `/${locale}/dashboard`, label: t("home"), icon: Home },
    { href: `/${locale}/dashboard/logros`, label: t("achievements"), icon: Trophy },
    { href: `/${locale}/dashboard/timeline`, label: t("timeline"), icon: BarChart3 },
    { href: `/${locale}/dashboard/settings`, label: t("settings"), icon: Settings },
  ];

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col md:border-r md:border-border md:bg-surface-card">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <img src="/logo.svg" alt="" className="h-2 w-2" aria-hidden="true" />
            <span className="ml-2 text-xl font-bold text-text">No Smoking</span>
          </div>

          {/* Nav items */}
          <nav className="flex-1 px-3 space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.href === `/${locale}/dashboard`
                  ? pathname === `/${locale}/dashboard`
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-text-muted hover:bg-accent hover:text-text"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User menu at bottom */}
        <div className="flex-shrink-0 flex border-t border-border p-4">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-10 w-10",
              },
            }}
          />
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border bg-surface-card">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive =
              item.href === `/${locale}/dashboard`
                ? pathname === `/${locale}/dashboard`
                : pathname.startsWith(item.href);

            return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 flex-1 h-full text-xs font-medium transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-text-muted"
                  )}
                >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

"use client";

import { AppSidebar } from "@/components/custom/app-sidebar";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import React from "react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    <div className="h-screen w-full">
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <main className="w-full flex-1 overflow-auto">
          <div className="flex items-center justify-between gap-4 px-4">
            <SidebarTrigger className="bg-primary text-primary-foreground m-4 h-8 w-8" />
            <div className="flex items-center gap-2">
              <AnimatedThemeToggler className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 shadow-sm transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white" />

              {pathname === "/dashboard" && (
                <h1 className="px-4 text-3xl font-semibold tracking-tight">
                  dashboard
                </h1>
              )}
              {pathname === "/dashboard/links" && (
                <h1 className="px-4 text-3xl font-semibold tracking-tight">
                  links
                </h1>
              )}
              {pathname === "/dashboard/analytics" && (
                <h1 className="px-4 text-3xl font-semibold tracking-tight">
                  analytics
                </h1>
              )}
              {pathname === "/dashboard/settings" && (
                <h1 className="px-4 text-3xl font-semibold tracking-tight">
                  settings
                </h1>
              )}
              {pathname === "/dashboard/domains" && (
                <h1 className="px-4 text-3xl font-semibold tracking-tight">
                  domains
                </h1>
              )}
              {pathname === "/dashboard/integrations" && (
                <h1 className="px-4 text-3xl font-semibold tracking-tight">
                  integrations
                </h1>
              )}
            </div>
          </div>
          <div>{children}</div>
        </main>
      </SidebarProvider>
    </div>
  );
};

export default DashboardLayout;

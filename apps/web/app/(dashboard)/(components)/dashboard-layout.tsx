"use client";

import { AppSidebar } from "@/components/custom/app-sidebar";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace("/signin");
    }
  }, [isPending, session, router]);

  if (isPending) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-50 dark:bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Verifying session...
          </p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="h-screen w-full">
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <main className="w-full flex-1 overflow-auto">
          <div className="flex items-center justify-between gap-4 px-4">
            <SidebarTrigger className="bg-primary text-primary-foreground m-4 h-8 w-8 cursor-pointer" />
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
              {pathname === "/dashboard/social-media" && (
                <h1 className="px-4 text-3xl font-semibold tracking-tight">
                  social media
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

"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

import {
  LayoutDashboard,
  Link2,
  BarChart3,
  Settings,
  LogOut,
  User,
  Pentagon,
  Earth,
  CodeSquare,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Links",
    url: "/dashboard/links",
    icon: Link2,
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Public Profile",
    url: "/public-profile",
    icon: User,
  },
  {
    title: "Domains",
    url: "/dashboard/domains",
    icon: Earth,
  },
  {
    title: "Integrations",
    url: "/dashboard/integrations",
    icon: CodeSquare,
  },
];

const bottomMenuItems = [
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const logoutHandler = async () => {
    await authClient.signOut();
    await authClient.revokeSessions();
    // Dispatch logout event for navbar to catch
    window.dispatchEvent(new Event("logout-event"));
    toast.success("Logged out successfully");
    router.push("/");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex items-center gap-2 px-2 py-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity duration-200 hover:opacity-90"
        >
          <div className="bg-foreground text-background flex h-8 w-8 items-center justify-center rounded-lg shadow-sm">
            <Pentagon size={24} strokeWidth={2.5} className="text-background" />
          </div>
          <span className="text-foreground font-serif text-2xl font-bold tracking-tight group-data-[state=collapsed]:hidden">
            linkforge
          </span>
        </Link>
        <div></div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {/* <SidebarGroupLabel className="group-data-[state=collapsed]:hidden">
            Main Menu
          </SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.url;

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url}>
                        <Icon className="h-4 w-4" />
                        <span className="group-data-[state=collapsed]:hidden">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[state=collapsed]:hidden">
            Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.url;

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url}>
                        <Icon className="h-4 w-4" />
                        <span className="group-data-[state=collapsed]:hidden">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="w-full cursor-pointer text-left focus:border-none focus:ring-0 focus:outline-none"
                  asChild
                >
                  <Button
                    variant="outline"
                    onClick={() => router.push("/dashboard/profile")}
                    className="flex items-center justify-start gap-3 text-sm font-medium focus:border-none focus:ring-0 focus:outline-none"
                  >
                    <User className="h-4 w-4" />
                    <span className="group-data-[state=collapsed]:hidden">
                      Profile
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-sm">
                      Linkforge&apos;s Future Roadmap
                    </DropdownMenuLabel>
                    <DropdownMenuItem className="cursor-pointer">
                      Docs
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      Version 2(Better & More)
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Button
                        className="w-full cursor-pointer bg-white text-left hover:bg-red-50 focus:border-none focus:ring-0 focus:outline-none dark:bg-zinc-200 dark:hover:bg-red-500"
                        onClick={logoutHandler}
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </Button>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

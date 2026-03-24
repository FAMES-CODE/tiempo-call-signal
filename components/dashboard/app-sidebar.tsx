"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Headphones,
  Home,
  LayoutDashboard,
  PhoneCall,
  Settings2,
  Users,
} from "lucide-react";

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
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

type NavItem = {
  title: string;
  url: string;
  icon: ComponentType<{ className?: string }>;
};

const mainNav: NavItem[] = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Calls",
    url: "/dashboard/calls",
    icon: PhoneCall,
  },
  {
    title: "Customers",
    url: "/dashboard/customers",
    icon: Users,
  },
];

const systemNav: NavItem[] = [
  {
    title: "Administration",
    url: "/dashboard/admin",
    icon: Settings2,
  },
];

function isNavActive(pathname: string, url: string) {
  if (url === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname === url || pathname.startsWith(`${url}/`);
}

function AppSidebar() {
  const pathname = usePathname() ?? "/dashboard";
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border/80 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[active=true]:bg-sidebar-accent"
              render={
                <Link
                  href="/dashboard"
                  aria-label="Tiempo Call Signal home"
                  title="Tiempo Call Signal"
                />
              }
              isActive={pathname === "/dashboard"}
            >
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg",
                  "bg-primary text-primary-foreground font-semibold text-sm shadow-sm",
                )}
              >
                <LayoutDashboard className="size-4" aria-hidden />
              </div>
              <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  Tiempo Call Signal
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  Support workspace
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    render={
                      <Link href={item.url} title={item.title} prefetch />
                    }
                    isActive={isNavActive(pathname, item.url)}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="mx-2" />

        {session?.user.role === "admin" ? (
          <>
            {session.user.role === "admin" && (
              <SidebarGroup>
                <SidebarGroupLabel>System</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem key="admin">
                      <SidebarMenuButton
                        render={
                          <Link
                            href="/dashboard/admin"
                            title="Administration"
                            prefetch
                          />
                        }
                        isActive={isNavActive(pathname, "/dashboard/admin")}
                      >
                        <Settings2 />
                        <span>Administration</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </>
        ) : null}
      </SidebarContent>
    </Sidebar>
  );
}

export default AppSidebar;

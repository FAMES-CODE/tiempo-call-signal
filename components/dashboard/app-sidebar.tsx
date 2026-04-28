"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, PhoneCall, Settings2, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useLocalePrefix, withLocalePath } from "@/lib/locale-path";

type NavItem = {
  titleKey: string;
  url: string;
  icon: ComponentType<{ className?: string }>;
};

const mainNav: NavItem[] = [
  {
    titleKey: "common.dashboard.nav.overview",
    url: "/dashboard",
    icon: Home,
  },
  {
    titleKey: "common.dashboard.nav.calls",
    url: "/dashboard/calls",
    icon: PhoneCall,
  },
  {
    titleKey: "common.dashboard.nav.customers",
    url: "/dashboard/customers",
    icon: Users,
  },
];

function isNavActive(pathname: string, href: string) {
  const path = pathname.replace(/\/$/, "") || "/";
  const target = href.replace(/\/$/, "") || "/";
  if (target.endsWith("/dashboard") && !target.includes("/dashboard/")) {
    return path === target;
  }
  return path === target || path.startsWith(`${target}/`);
}

function AppSidebar() {
  const pathname = usePathname() ?? "/dashboard";
  const { data: session, status } = useSession();
  const { t } = useTranslation("common");
  const prefix = useLocalePrefix();

  if (status === "loading") {
    return <div>{t("common.dashboard.nav.loading")}</div>;
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
                  href={withLocalePath(prefix, "/dashboard")}
                  aria-label={t("common.dashboard.nav.homeAria")}
                  title={t("common.dashboard.nav.homeTitle")}
                />
              }
              isActive={isNavActive(pathname, withLocalePath(prefix, "/dashboard"))}
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
                <span className="truncate font-semibold">{t("common.dashboard.nav.homeTitle")}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {t("common.dashboard.nav.supportWorkspace")}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        <SidebarGroup>
          <SidebarGroupLabel>{t("common.dashboard.nav.workspace")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => {
                const href = withLocalePath(prefix, item.url);
                const title = t(item.titleKey);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      render={<Link href={href} title={title} prefetch />}
                      isActive={isNavActive(pathname, href)}
                    >
                      <item.icon />
                      <span>{title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="mx-2" />

        {session?.user.role === "admin" ? (
          <>
            {session.user.role === "admin" && (
              <SidebarGroup>
                <SidebarGroupLabel>{t("common.dashboard.nav.system")}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem key="admin">
                      <SidebarMenuButton
                        render={
                          <Link
                            href={withLocalePath(prefix, "/dashboard/admin")}
                            title={t("common.dashboard.nav.administration")}
                            prefetch
                          />
                        }
                        isActive={isNavActive(pathname, withLocalePath(prefix, "/dashboard/admin"))}
                      >
                        <Settings2 />
                        <span>{t("common.dashboard.nav.administration")}</span>
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

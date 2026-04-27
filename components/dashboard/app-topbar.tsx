"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Bell, ChevronRight, LogOut, Settings, User } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { ModeToggle } from "@/components/mode-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { getLocalePrefixFromPathname, withLocalePath } from "@/lib/locale-path";
import LanguageSwitcher from "../i18n/language-switcher";

const ROUTE_TITLE_KEYS: Record<string, string> = {
  "/dashboard": "common.dashboard.nav.overview",
  "/dashboard/customers": "common.dashboard.nav.customers",
  "/dashboard/calls": "common.dashboard.nav.calls",
  "/dashboard/admin": "common.dashboard.nav.administration",
};

function getBreadcrumb(pathname: string, t: (key: string) => string) {
  const localePrefix = getLocalePrefixFromPathname(pathname);
  const withoutLocale = localePrefix
    ? pathname.replace(new RegExp(`^${localePrefix}`), "") || "/dashboard"
    : pathname || "/dashboard";
  const normalized = withoutLocale.startsWith("/")
    ? withoutLocale
    : `/${withoutLocale}`;
  const base = normalized.startsWith("/dashboard") ? normalized : "/dashboard";

  if (base === "/dashboard") {
    return [
      {
        label: t(ROUTE_TITLE_KEYS["/dashboard"]),
        href: withLocalePath(localePrefix, "/dashboard"),
      },
    ];
  }
  const crumbs: { label: string; href: string }[] = [
    {
      label: t(ROUTE_TITLE_KEYS["/dashboard"]),
      href: withLocalePath(localePrefix, "/dashboard"),
    },
  ];
  const rest = base.replace("/dashboard", "") || "";
  const segments = rest.split("/").filter(Boolean);
  let acc = "/dashboard";
  for (const segment of segments) {
    acc += `/${segment}`;
    const titleKey = ROUTE_TITLE_KEYS[acc];
    const label = titleKey
      ? t(titleKey)
      : segment.charAt(0).toUpperCase() + segment.slice(1);
    crumbs.push({ label, href: withLocalePath(localePrefix, acc) });
  }
  return crumbs;
}

function initialsFromUsername(username: string) {
  const parts = username.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return username.slice(0, 2).toUpperCase() || "U";
}

function AppTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t } = useTranslation("common");
  const localePrefix = getLocalePrefixFromPathname(pathname ?? "");
  const crumbs = useMemo(
    () => getBreadcrumb(pathname ?? "/dashboard", t),
    [pathname, t],
  );
  const username = session?.user?.username ?? "User";
  const roleLabel =
    session?.user?.role === "admin"
      ? t("common.dashboard.topbar.roleAdmin")
      : t("common.dashboard.topbar.roleUser");

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 shrink-0 flex-col border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70",
        "md:h-16",
      )}
    >
      <div className="flex h-14 items-center gap-2 px-3 md:h-16 md:gap-4 md:px-4">
        <SidebarTrigger className="-ml-1" />

        <Separator orientation="vertical" className="mr-1 hidden  md:block" />

        <nav
          className="hidden min-w-0 flex-1 items-center gap-1 text-sm text-muted-foreground md:flex"
          aria-label="Breadcrumb"
        >
          {crumbs.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-1 truncate">
              {i > 0 && (
                <ChevronRight
                  className="size-3.5 shrink-0 opacity-50"
                  aria-hidden
                />
              )}
              {i === crumbs.length - 1 ? (
                <span className="truncate font-semibold text-foreground">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="truncate transition-colors hover:text-foreground"
                >
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>

        <div className="relative flex min-w-0 flex-1 md:max-w-md md:flex-initial lg:max-w-lg">
          <Input
            type="search"
            placeholder={t("common.dashboard.topbar.searchPlaceholder")}
            className="h-9 w-full pl-3 md:bg-muted/50"
            aria-label={t("common.dashboard.topbar.searchAria")}
            readOnly
            title={t("common.dashboard.topbar.searchTitle")}
          />
        </div>

        <div className="ml-auto flex items-center gap-1 md:gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="hidden sm:inline-flex"
            aria-label={t("common.dashboard.topbar.notificationsAria")}
            disabled
            title={t("common.dashboard.topbar.notificationsTitle")}
          >
            <Bell className="size-4" />
          </Button>

          <ModeToggle />

          {status === "authenticated" ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg p-1.5 text-left outline-none ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <Avatar className="size-8 border border-border">
                  <AvatarFallback className="text-xs font-medium">
                    {initialsFromUsername(username)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-[120px] truncate text-sm font-medium lg:inline">
                  {username}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">{username}</span>
                      <span className="text-xs text-muted-foreground">
                        {session?.user?.role === "admin" ||
                        session?.user?.role === "user"
                          ? roleLabel
                          : (session?.user?.role ?? roleLabel)}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(withLocalePath(localePrefix, "/dashboard"))
                    }
                  >
                    <User className="size-4" />
                    {t("common.dashboard.topbar.overview")}
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled className="opacity-60">
                    <Settings className="size-4" />
                    {t("common.dashboard.topbar.settings")}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() =>
                      signOut({
                        callbackUrl: withLocalePath(localePrefix, "/"),
                      })
                    }
                  >
                    <LogOut className="size-4" />
                    {t("common.dashboard.topbar.signOut")}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">?</AvatarFallback>
            </Avatar>
          )}
        </div>
        <div className="ml-auto">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}

export default AppTopbar;

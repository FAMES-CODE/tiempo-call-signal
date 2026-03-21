"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Bell, ChevronRight, LogOut, Settings, User } from "lucide-react";

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

const ROUTE_TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/customers": "Customers",
  "/dashboard/calls": "Calls",
  "/dashboard/admin": "Administration",
};

function getBreadcrumb(pathname: string) {
  const normalized = pathname || "/dashboard";
  if (normalized === "/dashboard") {
    return [{ label: ROUTE_TITLES["/dashboard"], href: "/dashboard" }];
  }
  const crumbs: { label: string; href: string }[] = [
    { label: ROUTE_TITLES["/dashboard"], href: "/dashboard" },
  ];
  const rest = normalized.replace("/dashboard", "") || "";
  const segments = rest.split("/").filter(Boolean);
  let acc = "/dashboard";
  for (const segment of segments) {
    acc += `/${segment}`;
    const title =
      ROUTE_TITLES[acc] ?? segment.charAt(0).toUpperCase() + segment.slice(1);
    crumbs.push({ label: title, href: acc });
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
  const crumbs = getBreadcrumb(pathname ?? "/dashboard");
  const username = session?.user?.username ?? "User";

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 shrink-0 flex-col border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70",
        "md:h-16",
      )}
    >
      <div className="flex h-14 items-center gap-2 px-3 md:h-16 md:gap-4 md:px-4">
        <SidebarTrigger className="-ml-1" />

        <Separator
          orientation="vertical"
          className="mr-1 hidden h-6 md:block"
        />

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
            placeholder="Search calls, customers…"
            className="h-9 w-full pl-3 md:bg-muted/50"
            aria-label="Search"
            readOnly
            title="Search will be available in a future update"
          />
        </div>

        <div className="ml-auto flex items-center gap-1 md:gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="hidden sm:inline-flex"
            aria-label="Notifications"
            disabled
            title="No new notifications"
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
                        {session?.user?.role ?? "user"}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                    <User className="size-4" />
                    Overview
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled className="opacity-60">
                    <Settings className="size-4" />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="size-4" />
                    Sign out
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
      </div>
    </header>
  );
}

export default AppTopbar;

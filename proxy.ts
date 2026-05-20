import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import i18nConfig from "./i18n.config";

function getLocaleFromPath(path: string) {
  const maybeLocale = path.split("/")[1];
  if (i18nConfig.supportedLngs.includes(maybeLocale)) {
    return maybeLocale;
  }
  return i18nConfig.fallbackLng;
}

function hasLocalePrefix(path: string) {
  const maybeLocale = path.split("/")[1];
  return i18nConfig.supportedLngs.includes(maybeLocale);
}

function withLocale(path: string, locale: string) {
  if (path === "/") return `/${locale}`;
  return `/${locale}${path}`;
}

function stripLocaleFromPath(path: string) {
  const segments = path.split("/");
  const maybeLocale = segments[1];
  if (i18nConfig.supportedLngs.includes(maybeLocale)) {
    const stripped = `/${segments.slice(2).join("/")}`;
    return stripped === "/" ? stripped : stripped.replace(/\/$/, "");
  }
  return path === "/" ? path : path.replace(/\/$/, "");
}

export const proxy = withAuth(
  (req) => {
    const token = req.nextauth.token;
    const locale = getLocaleFromPath(req.nextUrl.pathname);
    const path = stripLocaleFromPath(req.nextUrl.pathname);
    const mustChangePassword = Boolean(token?.mustChangePassword);
    const isChangePasswordPage = path === "/change-password";
    const isApiRoute = path.startsWith("/api/");

    // Enforce locale-prefixed routes: `/dashboard` -> `/<lng>/dashboard`
    if (!isApiRoute && !hasLocalePrefix(req.nextUrl.pathname)) {
      return NextResponse.redirect(new URL(withLocale(path, locale), req.url));
    }

    if (mustChangePassword && !isChangePasswordPage) {
      if (isApiRoute) {
        return NextResponse.json(
          { error: "Password change required" },
          { status: 403 },
        );
      }
      return NextResponse.redirect(
        new URL(withLocale("/change-password", locale), req.url),
      );
    }

    if (!mustChangePassword && isChangePasswordPage) {
      return NextResponse.redirect(
        new URL(withLocale("/dashboard", locale), req.url),
      );
    }

    const isAdminRoute =
      path.startsWith("/dashboard/admin") || path.startsWith("/api/admin");
    const role = token?.role;

    if (path === "/" && token) {
      const dest = mustChangePassword ? "/change-password" : "/dashboard";
      return NextResponse.redirect(new URL(withLocale(dest, locale), req.url));
    }

    if (path === "/register" && token && role !== "admin") {
      const dest = mustChangePassword ? "/change-password" : "/dashboard";
      return NextResponse.redirect(new URL(withLocale(dest, locale), req.url));
    }

    if (isAdminRoute && role !== "admin") {
      if (isApiRoute) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(
        new URL(withLocale("/dashboard", locale), req.url),
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = stripLocaleFromPath(req.nextUrl.pathname);
        if (path === "/") return true;
        return !!token;
      },
    },
    pages: { signIn: `/${i18nConfig.fallbackLng}` },
  },
);

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|uploads).*)",
    "/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js|site.webmanifest).*)",
  ],
};

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  (req) => {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const mustChangePassword = Boolean(token?.mustChangePassword);
    const isChangePasswordPage = path === "/change-password";
    const isApiRoute = path.startsWith("/api/");

    if (mustChangePassword && !isChangePasswordPage) {
      if (isApiRoute) {
        return NextResponse.json(
          { error: "Password change required" },
          { status: 403 },
        );
      }
      return NextResponse.redirect(new URL("/change-password", req.url));
    }

    if (!mustChangePassword && isChangePasswordPage) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    const isAdminRoute =
      path.startsWith("/dashboard/admin") || path.startsWith("/api/admin");
    const role = token?.role;

    // If user is authenticated and trying to access login page (/), redirect
    if (path === "/" && token) {
      const dest = mustChangePassword ? "/change-password" : "/dashboard";
      return NextResponse.redirect(new URL(dest, req.url));
    }

    if (path === "/register" && token) {
      const dest = mustChangePassword ? "/change-password" : "/dashboard";
      return NextResponse.redirect(new URL(dest, req.url));
    }

    if (isAdminRoute && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to login page (/) and register page even without token
        if (req.nextUrl.pathname === "/" || req.nextUrl.pathname === "/register") {
          return true;
        }
        // Require token for all other routes
        return !!token;
      },
    },
    pages: {
      signIn: "/",
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};


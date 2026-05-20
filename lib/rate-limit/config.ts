import type { RateLimitConfig, RateLimitTier } from "./types";

export const RATE_LIMIT_ENABLED =
  process.env.RATE_LIMIT_ENABLED !== "false";

export const RATE_LIMIT_TIERS: Record<RateLimitTier, RateLimitConfig> = {
  /** Connexion / brute-force */
  auth: {
    windowMs: 15 * 60 * 1000,
    maxRequests: Number(process.env.RATE_LIMIT_AUTH_MAX) || 20,
  },
  /** Stats dashboard (polling SWR ~10–30 s) */
  stats: {
    windowMs: 60 * 1000,
    maxRequests: Number(process.env.RATE_LIMIT_STATS_MAX) || 45,
  },
  /** Listes lourdes : clients, fiches d'appel */
  heavyRead: {
    windowMs: 60 * 1000,
    maxRequests: Number(process.env.RATE_LIMIT_HEAVY_READ_MAX) || 90,
  },
  /** PATCH fiches, notes, résolution, suppressions */
  heavyWrite: {
    windowMs: 60 * 1000,
    maxRequests: Number(process.env.RATE_LIMIT_HEAVY_WRITE_MAX) || 60,
  },
  /** Upload photos fiches */
  upload: {
    windowMs: 60 * 1000,
    maxRequests: Number(process.env.RATE_LIMIT_UPLOAD_MAX) || 20,
  },
  /** Admin : sync, stats, reset password */
  admin: {
    windowMs: 60 * 1000,
    maxRequests: Number(process.env.RATE_LIMIT_ADMIN_MAX) || 30,
  },
  /** Firebird / bons */
  firebird: {
    windowMs: 60 * 1000,
    maxRequests: Number(process.env.RATE_LIMIT_FIREBIRD_MAX) || 25,
  },
  default: {
    windowMs: 60 * 1000,
    maxRequests: Number(process.env.RATE_LIMIT_DEFAULT_MAX) || 120,
  },
};

/** Routes NextAuth (session, callback) — pas de limite applicative ici */
export function isNextAuthRoute(path: string): boolean {
  return (
    path.startsWith("/api/auth/signin") ||
    path.startsWith("/api/auth/signout") ||
    path.startsWith("/api/auth/callback") ||
    path.startsWith("/api/auth/session") ||
    path.startsWith("/api/auth/csrf") ||
    path.startsWith("/api/auth/providers") ||
    path === "/api/auth/[...nextauth]" ||
    path.includes("/api/auth/callback/")
  );
}

export function resolveRateLimitTier(
  path: string,
  method: string,
): RateLimitTier {
  const m = method.toUpperCase();

  if (path === "/api/auth/login") return "auth";

  if (path.startsWith("/api/admin/sync")) return "admin";
  if (path.startsWith("/api/admin")) {
    return m === "GET" ? "heavyRead" : "admin";
  }

  if (path === "/api/stats") return "stats";

  if (path.startsWith("/api/customers")) return "heavyRead";

  if (path === "/api/sheets" && m === "GET") return "heavyRead";
  if (path.startsWith("/api/sheets") && path.includes("/pictures") && m === "POST") {
    return "upload";
  }
  if (path.startsWith("/api/sheets")) {
    return m === "GET" ? "heavyRead" : "heavyWrite";
  }

  if (path.startsWith("/api/firebird")) return "firebird";

  if (path === "/api/users" && m === "GET") return "heavyRead";

  if (m === "GET" || m === "HEAD") return "default";
  if (m === "POST" || m === "PATCH" || m === "PUT" || m === "DELETE") {
    return "heavyWrite";
  }

  return "default";
}

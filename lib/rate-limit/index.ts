import { NextResponse, type NextRequest } from "next/server";
import type { JWT } from "next-auth/jwt";

import {
  isNextAuthRoute,
  RATE_LIMIT_ENABLED,
  RATE_LIMIT_TIERS,
  resolveRateLimitTier,
} from "./config";
import { consumeRateLimit } from "./store";
import type { RateLimitResult, RateLimitTier } from "./types";

export function getClientIp(request: NextRequest | Request): string {
  const headers = request.headers;
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

export function buildRateLimitKey(
  request: NextRequest | Request,
  tier: RateLimitTier,
  userId?: string | number | null,
): string {
  const path = new URL(request.url).pathname;
  const method = request.method;
  const actor = userId != null ? `user:${userId}` : `ip:${getClientIp(request)}`;
  return `${tier}:${method}:${path}:${actor}`;
}

export function checkRateLimit(
  key: string,
  tier: RateLimitTier = "default",
): RateLimitResult {
  const config = RATE_LIMIT_TIERS[tier];
  const { count, resetAt } = consumeRateLimit(
    key,
    config.maxRequests,
    config.windowMs,
  );

  const remaining = Math.max(0, config.maxRequests - count);
  const retryAfterSec = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));

  return {
    success: count <= config.maxRequests,
    limit: config.maxRequests,
    remaining,
    resetAt,
    retryAfterSec,
  };
}

export function rateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
    ...(result.success ? {} : { "Retry-After": String(result.retryAfterSec) }),
  };
}

export function rateLimitExceededResponse(
  result: RateLimitResult,
): NextResponse {
  return NextResponse.json(
    {
      error: "Too many requests",
      message:
        "Trop de requêtes. Réessayez dans quelques instants.",
      retryAfterSec: result.retryAfterSec,
    },
    {
      status: 429,
      headers: rateLimitHeaders(result),
    },
  );
}

/** Garde pour Route Handlers (App Router) */
export function enforceRateLimit(
  request: Request,
  options?: { tier?: RateLimitTier; userId?: string | number | null },
): NextResponse | null {
  if (!RATE_LIMIT_ENABLED) return null;

  const path = new URL(request.url).pathname;
  if (isNextAuthRoute(path)) return null;

  const tier =
    options?.tier ?? resolveRateLimitTier(path, request.method);
  const key = buildRateLimitKey(request, tier, options?.userId);
  const result = checkRateLimit(key, tier);

  if (!result.success) return rateLimitExceededResponse(result);
  return null;
}

/** Garde pour le proxy (middleware) */
export function enforceApiRateLimitFromProxy(
  request: NextRequest,
  apiPath: string,
  token?: JWT | null,
): NextResponse | null {
  if (!RATE_LIMIT_ENABLED) return null;
  if (isNextAuthRoute(apiPath)) return null;

  const tier = resolveRateLimitTier(apiPath, request.method);
  const userId = token?.id ?? token?.sub ?? null;
  const key = buildRateLimitKey(request, tier, userId);
  const result = checkRateLimit(key, tier);

  if (!result.success) return rateLimitExceededResponse(result);

  const response = NextResponse.next();
  const headers = rateLimitHeaders(result);
  for (const [name, value] of Object.entries(headers)) {
    response.headers.set(name, value);
  }
  return response;
}

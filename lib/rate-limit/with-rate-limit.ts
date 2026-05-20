import { NextResponse } from "next/server";

import { enforceRateLimit } from "./index";
import type { RateLimitTier } from "./types";

type RouteHandler = (
  request: Request,
  context?: { params: Promise<Record<string, string>> },
) => Promise<Response> | Response;

type RateLimitOptions = {
  tier?: RateLimitTier;
  getUserId?: (request: Request) => Promise<string | number | null | undefined>;
};

/**
 * Wraps a Route Handler with rate limiting (double net if the proxy is bypassed).
 */
export function withRateLimit(
  handler: RouteHandler,
  options?: RateLimitOptions,
): RouteHandler {
  return async (request, context) => {
    const userId = options?.getUserId
      ? await options.getUserId(request)
      : undefined;
    const blocked = enforceRateLimit(request, {
      tier: options?.tier,
      userId: userId ?? null,
    });
    if (blocked) return blocked;
    return handler(request, context);
  };
}

/** Réponse 429 avec en-têtes standards (usage manuel) */
export { enforceRateLimit, rateLimitExceededResponse } from "./index";

export type RateLimitTier =
  | "auth"
  | "stats"
  | "heavyRead"
  | "heavyWrite"
  | "upload"
  | "admin"
  | "firebird"
  | "default";

export type RateLimitConfig = {
  windowMs: number;
  maxRequests: number;
};

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSec: number;
};

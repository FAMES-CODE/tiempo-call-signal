"use client";

import { usePathname } from "next/navigation";

const SUPPORTED_LOCALES = new Set(["en", "fr", "ar"]);

/** Prefix like `/fr` when the URL is under a `[lng]` segment; otherwise `""`. */
export function getLocalePrefixFromPathname(pathname: string): string {
  const seg = pathname.split("/").filter(Boolean)[0];
  if (seg && SUPPORTED_LOCALES.has(seg)) return `/${seg}`;
  return "";
}

export function useLocalePrefix(): string {
  const pathname = usePathname() ?? "";
  return getLocalePrefixFromPathname(pathname);
}

/** Prefix a path with the active locale segment when applicable (e.g. `/dashboard` → `/fr/dashboard`). */
export function withLocalePath(prefix: string, path: string): string {
  if (!path.startsWith("/")) return path;
  if (!prefix) return path;
  if (path === "/") return prefix;
  return `${prefix}${path}`;
}

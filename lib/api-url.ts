/** Build an API path; empty base = same-origin relative URL. */
export function apiUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

/** Normalize a public asset path (always root-absolute, never locale-prefixed). */
export function normalizePublicAssetPath(path: string): string {
  if (!path) return path;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return path.startsWith("/") ? path : `/${path}`;
}

/** Serve call-sheet images via API (no locale prefix, works under /en/dashboard). */
export function callSheetPictureFileUrl(
  callSheetId: number,
  pictureId: number,
): string {
  return apiUrl(
    `/api/sheets/${callSheetId}/pictures/${pictureId}/file`,
  );
}

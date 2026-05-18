/**
 * API base URL for Vercel deployment (same origin by default).
 * Set NEXT_PUBLIC_API_URL only if the API is hosted on a different domain.
 */
export function getApiBase(): string {
  const url = process.env.NEXT_PUBLIC_API_URL ?? "";
  return url.replace(/\/$/, "");
}

export function apiUrl(path: string): string {
  const base = getApiBase();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

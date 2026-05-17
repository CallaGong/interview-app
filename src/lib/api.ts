/**
 * API 基址：生产环境 Worker 与静态资源同域，留空即可。
 * 本地开发：Next.js 通过 rewrites 代理到 wrangler dev (8787)。
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

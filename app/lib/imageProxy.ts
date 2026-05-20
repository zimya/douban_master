import { IMAGE_PROXY_URL } from "./constants";

/**
 * Convert a Douban image URL to a proxied URL.
 * Douban checks Referer headers; direct browser requests get 403.
 */
export function getProxiedImageUrl(originalUrl: string): string {
  if (!originalUrl) return "";
  return `${IMAGE_PROXY_URL}?url=${encodeURIComponent(originalUrl)}`;
}

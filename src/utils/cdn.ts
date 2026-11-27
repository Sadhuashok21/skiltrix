/**
 * Centralized CDN asset resolution for Ascentracore Solutions Ecosystem.
 * CDN Domain: https://cdn.ascentracoresolutions.com/
 *
 * Paths:
 * - SkilTrix:
 *   - Images: st/images/
 *   - PDFs:   st/pdfs/
 *   - Videos: st/videos/
 * - SFS:
 *   - Images:   sfs/images/
 *   - Zipfiles: sfs/zipfiles/
 */

export const CDN_BASE_URL = (
  import.meta.env.VITE_CDN_BASE_URL || "https://cdn.ascentracoresolutions.com"
).replace(/\/+$/, "");

export const SKILTRIX_CDN = {
  images: `${CDN_BASE_URL}/st/images`,
  pdfs: `${CDN_BASE_URL}/st/pdfs`,
  videos: `${CDN_BASE_URL}/st/videos`,
} as const;

export const SFS_CDN = {
  images: `${CDN_BASE_URL}/sfs/images`,
  zipfiles: `${CDN_BASE_URL}/sfs/zipfiles`,
} as const;

const PLACEHOLDER_ASSET_NAMES = new Set([
  "default_video.webp",
  "default_video.png",
  "default_course.png",
  "image.webp",
  "course_thumb.webp",
  "placeholder-image.webp",
]);

export function isPlaceholderStAsset(filename?: string): boolean {
  if (!filename) return true;
  const trimmed = filename.trim();
  if (!trimmed) return true;
  const base = trimmed.split("?")[0].split("/").pop()?.toLowerCase() || "";
  return PLACEHOLDER_ASSET_NAMES.has(base);
}

export function getStImageUrl(filename?: string, fallback = ""): string {
  if (!filename || isPlaceholderStAsset(filename)) return fallback;
  if (/^(https?:\/\/|\/media\/|\/assets\/|data:)/i.test(filename)) return filename;
  const clean = filename.replace(/^\/+/, "");
  if (clean.startsWith("st/images/")) return `${CDN_BASE_URL}/${clean}`;
  return `${SKILTRIX_CDN.images}/${clean}`;
}

export function getStVideoUrl(filename?: string, fallback = ""): string {
  if (!filename) return fallback;
  if (/^https?:\/\//i.test(filename)) return filename;
  const clean = filename.replace(/^\/+/, "");
  if (clean.startsWith("st/videos/")) return `${CDN_BASE_URL}/${clean}`;
  return `${SKILTRIX_CDN.videos}/${clean}`;
}

export function getStPdfUrl(filename?: string, fallback = ""): string {
  if (!filename) return fallback;
  if (/^https?:\/\//i.test(filename)) return filename;
  const clean = filename.replace(/^\/+/, "");
  if (clean.startsWith("st/pdfs/")) return `${CDN_BASE_URL}/${clean}`;
  return `${SKILTRIX_CDN.pdfs}/${clean}`;
}

export function getSfsImageUrl(filename?: string, fallback = ""): string {
  if (!filename) return fallback;
  if (/^https?:\/\//i.test(filename)) return filename;
  const clean = filename.replace(/^\/+/, "");
  if (clean.startsWith("sfs/images/")) return `${CDN_BASE_URL}/${clean}`;
  return `${SFS_CDN.images}/${clean}`;
}

export function getSfsZipUrl(filename?: string, fallback = ""): string {
  if (!filename) return fallback;
  if (/^https?:\/\//i.test(filename)) return filename;
  const clean = filename.replace(/^\/+/, "");
  if (clean.startsWith("sfs/zipfiles/")) return `${CDN_BASE_URL}/${clean}`;
  return `${SFS_CDN.zipfiles}/${clean}`;
}


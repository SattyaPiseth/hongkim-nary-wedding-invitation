const FALLBACK_VERSION =
  typeof __BUILD_ASSET_VERSION__ !== "undefined"
    ? __BUILD_ASSET_VERSION__
    : new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 12);

export const STATIC_ASSET_VERSION =
  (import.meta?.env?.VITE_ASSET_VERSION &&
    String(import.meta.env.VITE_ASSET_VERSION)) ||
  FALLBACK_VERSION;

export function withAssetVersion(path = "") {
  if (!path) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}v=${encodeURIComponent(STATIC_ASSET_VERSION)}`;
}


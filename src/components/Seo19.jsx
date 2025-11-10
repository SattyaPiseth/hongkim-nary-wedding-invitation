import { useLocation } from "react-router-dom";
import { useMemo } from "react";
import { withAssetVersion } from "../utils/assetVersion.js";

const DEFAULTS = {
  siteName: "Hongkim & Nary Wedding",
  title: "Hongkim & Nary Wedding \u2014 Save the Date",
  description: "Join us in celebrating love. Ceremony details, schedule, map, and RSVP.",
  image: withAssetVersion("/images/seo/hongkim-nary.jpg"),
  imageAlt: "Hongkim & Nary Wedding invitation cover",
  imageWidth: 854,
  imageHeight: 1280,
  imageType: "image/jpeg",
  themeColor: "#ffffff",
  ogType: "website",
  twitterCard: "summary_large_image",
  locale: "km_KH",
};

const RAW_BASE_URL = import.meta.env.VITE_SITE_URL || "http://localhost:5173";
const BASE_URL = RAW_BASE_URL.replace(/\/+$/, "");

const absUrl = (path = "/") => {
  try {
    return new URL(path, BASE_URL).href;
  } catch {
    return path;
  }
};

const hostFromUrl = (input = "") => {
  try {
    return new URL(input).host;
  } catch {
    return "";
  }
};

const normalizeCanonical = (url) => {
  try {
    const u = new URL(url);
    u.search = "";
    u.hash = "";
    return u.href.replace(/\/+$/, "");
  } catch {
    return url;
  }
};

export default function Seo19({
  // content
  title,
  description,
  image = DEFAULTS.image,
  imageAlt = DEFAULTS.imageAlt,
  imageWidth = DEFAULTS.imageWidth,
  imageHeight = DEFAULTS.imageHeight,
  imageType = DEFAULTS.imageType,
  canonical,
  ogUrl,

  // indexing flags
  noindex = false,
  noarchive = false,
  noimageindex = false,
  nosnippet = false,

  // types / misc
  ogType = DEFAULTS.ogType,
  themeColor = DEFAULTS.themeColor,
  twitterCard = DEFAULTS.twitterCard,
  locale = DEFAULTS.locale,
  siteName = DEFAULTS.siteName,

  // JSON-LD: object or array
  jsonLd,

  // path override
  path,

  // social extras
  twitterSite,
  twitterDomain,
  twitterUrl,
  ogLocaleAlternates = [],

  // crawler-specific + freshness
  googleBot, // e.g., "noindex, nofollow, noarchive"
  bingBot, // same
  updatedTime, // ISO 8601

  children,
}) {
  const loc = useLocation();
  const currentPath = path ?? loc.pathname;
  const canonicalTarget = canonical || absUrl(currentPath);

  const pageUrl = useMemo(
    () => normalizeCanonical(canonicalTarget),
    [canonicalTarget]
  );

  const openGraphUrl = useMemo(
    () =>
      normalizeCanonical(
        ogUrl ? absUrl(ogUrl) : canonicalTarget
      ),
    [ogUrl, canonicalTarget]
  );

  const twitterShareUrl = useMemo(
    () =>
      twitterUrl ? normalizeCanonical(absUrl(twitterUrl)) : openGraphUrl,
    [twitterUrl, openGraphUrl]
  );

  // const pageTitle = title ? `${title} \u2022 ${siteName}` : DEFAULTS.title;
  const pageTitle = title || DEFAULTS.title;
  const pageDesc = description || DEFAULTS.description;

  const imageUrl = absUrl(image);
  const imageSecureUrl = imageUrl.replace(/^http:\/\//i, "https://");
  const twitterDomainValue = twitterDomain || hostFromUrl(twitterShareUrl);

  const robots = useMemo(
    () =>
      [
        noindex ? "noindex,nofollow" : "index,follow",
        noarchive && "noarchive",
        noimageindex && "noimageindex",
        nosnippet && "nosnippet",
        "max-image-preview:large",
      ]
        .filter(Boolean)
        .join(", "),
    [noindex, noarchive, noimageindex, nosnippet]
  );

  return (
    <>
      {/* Core */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDesc} />
      <meta name="robots" content={robots} />
      {googleBot && <meta name="googlebot" content={googleBot} />}
      {bingBot && <meta name="bingbot" content={bingBot} />}

      {/* Canonical */}
      <link rel="canonical" href={pageUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDesc} />
      <meta property="og:url" content={openGraphUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:secure_url" content={imageSecureUrl} />
      <meta property="og:image:alt" content={imageAlt} />
      {imageWidth && (
        <meta property="og:image:width" content={String(imageWidth)} />
      )}
      {imageHeight && (
        <meta property="og:image:height" content={String(imageHeight)} />
      )}
      <meta property="og:image:type" content={imageType} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      {ogLocaleAlternates.map((l) => (
        <meta key={l} property="og:locale:alternate" content={l} />
      ))}
      {updatedTime && <meta property="og:updated_time" content={updatedTime} />}

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      {twitterSite && <meta name="twitter:site" content={twitterSite} />}
      <meta property="twitter:url" content={twitterShareUrl} />
      {twitterDomainValue && (
        <meta property="twitter:domain" content={twitterDomainValue} />
      )}
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDesc} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={imageAlt} />

      {/* Theme */}
      {themeColor && <meta name="theme-color" content={themeColor} />}

      {/* Optional UX meta */}
      <meta name="format-detection" content="telephone=no" />

      {/* JSON-LD */}
      {jsonLd &&
        (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).map((obj, i) => (
          <script key={i} type="application/ld+json">
            {JSON.stringify(obj)}
          </script>
        ))}

      {children}
    </>
  );
}

import { useLocation } from "react-router-dom";
import { useMemo } from "react";

const DEFAULTS = {
  siteName: "Phaneth & Thamony Wedding",
  title: "Phaneth & Thamony Wedding — Save the Date",
  description: "Join us in celebrating love. Ceremony details, schedule, map, and RSVP.",
  image: "/images/seo/phaneth-thamony-logo.avif",
  imageAlt: "Phaneth & Thamony Wedding Cover",
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
  imageWidth,
  imageHeight,
  canonical,

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
  ogLocaleAlternates = [],

  // crawler-specific + freshness
  googleBot,    // e.g., "noindex, nofollow, noarchive"
  bingBot,      // same
  updatedTime,  // ISO 8601

  children,
}) {
  const loc = useLocation();
  const currentPath = path ?? loc.pathname;

  const pageUrl = useMemo(
    () => normalizeCanonical(canonical || absUrl(currentPath)),
    [canonical, currentPath]
  );

  // const pageTitle = title ? `${title} • ${siteName}` : DEFAULTS.title;
  const pageTitle = title || DEFAULTS.title;
  const pageDesc = description || DEFAULTS.description;

  const imageUrl = absUrl(image);
  const imageSecureUrl = imageUrl.replace(/^http:\/\//i, "https://");

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
      <meta property="og:url" content={pageUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:secure_url" content={imageSecureUrl} />
      <meta property="og:image:alt" content={imageAlt} />
      {imageWidth && <meta property="og:image:width" content={String(imageWidth)} />}
      {imageHeight && <meta property="og:image:height" content={String(imageHeight)} />}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      {ogLocaleAlternates.map((l) => (
        <meta key={l} property="og:locale:alternate" content={l} />
      ))}
      {updatedTime && <meta property="og:updated_time" content={updatedTime} />}

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      {twitterSite && <meta name="twitter:site" content={twitterSite} />}
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

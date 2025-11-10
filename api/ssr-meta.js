export const config = { runtime: "edge" };

const UUID_RX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const DEFAULT_IMAGE_ALT = "Hongkim & Nary Wedding invitation cover";
const DEFAULT_IMAGE_WIDTH = 854;
const DEFAULT_IMAGE_HEIGHT = 1280;

const esc = (s = "") =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

// Build/version used for social preview cache-busting (?v=...)
const BUILD_ID =
  (typeof process !== "undefined" &&
    process.env &&
    (process.env.VITE_ASSET_VERSION ||
      process.env.VITE_BUILD_ID ||
      process.env.BUILD_ID)) ||
  new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 12);

function withVersion(u, v = BUILD_ID) {
  try {
    const url = new URL(u);
    url.searchParams.set("v", v);
    return url.toString();
  } catch {
    return `${u}${u.includes("?") ? "&" : "?"}v=${encodeURIComponent(v)}`;
  }
}

function hostFromUrl(u = "") {
  try {
    return new URL(u).host;
  } catch {
    return "";
  }
}

function noStoreHeaders() {
  return {
    "content-type": "text/html; charset=utf-8",
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "Vercel-CDN-Cache-Control": "max-age=0, s-maxage=0, stale-while-revalidate=0",
  };
}

function render({
  title,
  description,
  canonical, // clean (no ?v) for SEO
  ogUrl, // share URL for bots
  image, // versioned image URL for bots
  imageAlt = DEFAULT_IMAGE_ALT,
  imageWidth = DEFAULT_IMAGE_WIDTH,
  imageHeight = DEFAULT_IMAGE_HEIGHT,
  imageType = "image/jpeg",
  locale = "km_KH",
  ogType = "website",
  noindex = false,
  updatedTime,
  jsonLd,
  twitterUrl,
  twitterDomain,
  twitterSite,
  twitterCard = "summary_large_image",
}) {
  const robots = noindex
    ? "noindex,nofollow,max-image-preview:large"
    : "index,follow,max-image-preview:large";
  const secureImage = image.replace(/^http:\/\//i, "https://");
  const shareUrl = ogUrl || canonical;
  const twitterShareUrl = twitterUrl || shareUrl;
  const twitterDomainValue = twitterDomain || hostFromUrl(shareUrl);
  const twitterSiteTag = twitterSite
    ? `<meta name="twitter:site" content="${esc(twitterSite)}" />`
    : "";
  const twitterDomainTag = twitterDomainValue
    ? `<meta property="twitter:domain" content="${twitterDomainValue}" />`
    : "";
  const imageAltEsc = esc(imageAlt);
  const jsonLdTag = jsonLd
    ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`
    : "";

  return `<!doctype html>
<html lang="km">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <title>${esc(title)}</title>
  <link rel="canonical" href="${canonical}" />

  <meta name="robots" content="${robots}" />
  ${
    noindex
      ? `<meta name="googlebot" content="noindex, nofollow, noarchive" />
  <meta name="bingbot" content="noindex, nofollow, noarchive" />`
      : ""
  }

  <meta name="description" content="${esc(description)}" />

  <!-- Open Graph -->
  <meta property="og:type" content="${ogType}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:url" content="${shareUrl}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:secure_url" content="${secureImage}" />
  <meta property="og:image:alt" content="${imageAltEsc}" />
  <meta property="og:image:width" content="${imageWidth}" />
  <meta property="og:image:height" content="${imageHeight}" />
  <meta property="og:image:type" content="${esc(imageType)}" />
  <meta property="og:site_name" content="Hongkim & Nary Wedding" />
  <meta property="og:locale" content="${locale}" />
  ${
    updatedTime
      ? `<meta property="og:updated_time" content="${updatedTime}" />`
      : ""
  }

  <!-- Twitter -->
  <meta name="twitter:card" content="${twitterCard}" />
  ${twitterSiteTag}
  <meta property="twitter:url" content="${twitterShareUrl}" />
  ${twitterDomainTag}
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="${image}" />
  <meta name="twitter:image:alt" content="${imageAltEsc}" />

  ${jsonLdTag}
</head>
<body>
  <noscript>JavaScript required.</noscript>
</body>
</html>`;
}

export default async function handler(req) {
  const url = new URL(req.url);
  const nowIso = new Date().toISOString();
  const userAgent = (req.headers.get("user-agent") || "").toLowerCase();
  const isFacebookBot = /facebookexternalhit|facebot/i.test(userAgent);

  // Prefer production canonical host
  const base =
    (typeof process !== "undefined" &&
      process.env &&
      process.env.VITE_SITE_URL) ||
    `${url.protocol}//${url.host}`;
  const siteUrl = base.replace(/\/+$/, "");
  const defaultImage = `${siteUrl}/images/seo/hongkim-nary.jpg`;

  const path = url.pathname.replace(/\/+$/, "") || "/";
  const slug = path.slice(1);

  // HOME -> indexable + JSON-LD
  if (path === "/") {
    const canonical = `${siteUrl}/`;
    const ogUrl = canonical;
    const imageV = withVersion(defaultImage);

    const site = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Hongkim & Nary Wedding",
      url: canonical,
    };
    const org = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Hongkim & Nary Wedding",
      url: canonical,
      logo: defaultImage,
    };

    const eventDate =
      (typeof process !== "undefined" &&
        process.env &&
        process.env.VITE_EVENT_DATE) ||
      undefined;
    const event = eventDate
      ? {
          "@context": "https://schema.org",
          "@type": "Event",
          "@id": `${canonical}#wedding-event`,
          name: "Hongkim & Nary Wedding",
          startDate: eventDate,
          eventAttendanceMode:
            "https://schema.org/OfflineEventAttendanceMode",
          eventStatus: "https://schema.org/EventScheduled",
          location: {
            "@type": "Place",
            name: "Phnom Penh",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Phnom Penh",
              addressCountry: "KH",
            },
          },
          image: [defaultImage],
          description:
            "Join us in celebrating love. Ceremony details, schedule, map, and RSVP.",
          organizer: { "@type": "Organization", name: "Hongkim & Nary" },
        }
      : null;

    return new Response(
      render({
        title: "Home \u2022 Hongkim & Nary Wedding",
        description:
          "Join us in celebrating love. Ceremony details, schedule, map, and RSVP.",
        canonical,
        ogUrl,
        image: imageV,
        locale: "km_KH",
        ogType: "website",
        updatedTime: nowIso,
        jsonLd: event ? [site, org, event] : [site, org],
      }),
      { status: 200, headers: noStoreHeaders() }
    );
  }

  // UUID -> always private (noindex), generic preview, canonical -> root
  if (UUID_RX.test(slug)) {
    const canonical = `${siteUrl}/`;
    const ogUrl = `${siteUrl}${path}`;
    const imageV = withVersion(defaultImage);
    const shouldNoIndex = !isFacebookBot; // let Facebook create previews while keeping invites private elsewhere
    return new Response(
      render({
        title: "Invitation \u2022 Hongkim & Nary Wedding",
        description: "Private invitation for the ceremony.",
        canonical,
        ogUrl,
        image: imageV,
        locale: "km_KH",
        ogType: "website",
        updatedTime: nowIso,
        noindex: shouldNoIndex,
        jsonLd: null,
      }),
      { status: 200, headers: noStoreHeaders() }
    );
  }

  // Fallback
  {
    const canonical = `${siteUrl}/`;
    const ogUrl = canonical;
    const imageV = withVersion(defaultImage);
    return new Response(
      render({
        title: "Hongkim & Nary Wedding",
        description:
          "Join us in celebrating love. Ceremony details, schedule, map, and RSVP.",
        canonical,
        ogUrl,
        image: imageV,
        locale: "km_KH",
        ogType: "website",
        updatedTime: nowIso,
      }),
      { status: 200, headers: noStoreHeaders() }
    );
  }
}

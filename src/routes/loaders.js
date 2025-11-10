import { findCustomerByUuid, isValidUuidFormat } from "../lib/customers";
import { withAssetVersion } from "../utils/assetVersion.js";

const OG_IMAGE_ALT = "Hongkim & Nary Wedding invitation cover";
const OG_IMAGE_TYPE = "image/jpeg";
const OG_IMAGE_WIDTH = 854;
const OG_IMAGE_HEIGHT = 1280;

const abs = (origin, path = "/") => {
  try {
    return new URL(path, origin).href;
  } catch {
    return path;
  }
};

export async function coverLoader({ params, request }) {
  const { uuid } = params || {};
  const requestUrl = new URL(request.url);
  const origin = import.meta?.env?.VITE_SITE_URL || requestUrl.origin;
  const shareUrl = abs(origin, requestUrl.pathname);
  let shareHost = requestUrl.host;
  try {
    shareHost = new URL(origin).host;
  } catch {
    // ignore parse errors and keep request host
  }

  // Public (index) route -> generic, indexable
  if (!uuid) {
    return {
      isValidInvite: false,
      customer: null,
      indexable: true,
      seo: {
        title: "Hongkim & Nary Wedding \u2014 Save the Date",
        description:
          "Join us in celebrating love. Ceremony details, schedule, map, and RSVP.",
        canonical: abs(origin, "/"),
        image: withAssetVersion("/images/seo/hongkim-nary.jpg"),
        imageAlt: OG_IMAGE_ALT,
        imageWidth: OG_IMAGE_WIDTH,
        imageHeight: OG_IMAGE_HEIGHT,
        imageType: OG_IMAGE_TYPE,
        ogUrl: shareUrl,
        twitterUrl: shareUrl,
        twitterDomain: shareHost,
        locale: "en_US",
        ogType: "website",
        updatedTime: new Date().toISOString(),
      },
    };
  }

  // Minimal change: do NOT redirect; show soft not-found (noindex + canonical to public)
  if (!isValidUuidFormat(uuid)) {
    return {
      isValidInvite: false,
      customer: null,
      indexable: false,
      seo: {
        title: "Invitation not found",
        description: "This invite link is invalid or has expired.",
        canonical: abs(origin, "/"), // <- canonical to public page
        image: withAssetVersion("/images/seo/hongkim-nary.jpg"),
        imageAlt: OG_IMAGE_ALT,
        imageWidth: OG_IMAGE_WIDTH,
        imageHeight: OG_IMAGE_HEIGHT,
        imageType: OG_IMAGE_TYPE,
        ogUrl: shareUrl,
        twitterUrl: shareUrl,
        twitterDomain: shareHost,
        locale: "en_US",
        ogType: "website",
        updatedTime: new Date().toISOString(),
      },
    };
  }

  const customer = findCustomerByUuid(uuid);

  // Not found -> non-indexable soft 404 (canonical to public)
  if (!customer) {
    return {
      isValidInvite: false,
      customer: null,
      indexable: false,
      seo: {
        title: "Invitation not found",
        description: "This invite link is invalid or has expired.",
        canonical: abs(origin, "/"), // <- canonical to public page
        image: withAssetVersion("/images/seo/hongkim-nary.jpg"),
        imageAlt: OG_IMAGE_ALT,
        imageWidth: OG_IMAGE_WIDTH,
        imageHeight: OG_IMAGE_HEIGHT,
        imageType: OG_IMAGE_TYPE,
        ogUrl: shareUrl,
        twitterUrl: shareUrl,
        twitterDomain: shareHost,
        locale: "en_US",
        ogType: "website",
        updatedTime: new Date().toISOString(),
      },
    };
  }

  // Minimal change: UUID pages are ALWAYS non-indexable + generic SEO (no JSON-LD)
  return {
    isValidInvite: true,
    customer,
    indexable: false,
    seo: {
      title: "Invitation",
      description: "Private invitation for the ceremony.",
      canonical: abs(origin, "/"), // <- canonical to public page
      image: withAssetVersion(customer?.coverImageUrl ?? "/images/seo/hongkim-nary.jpg"),
      imageAlt: OG_IMAGE_ALT,
      imageWidth: OG_IMAGE_WIDTH,
      imageHeight: OG_IMAGE_HEIGHT,
      imageType: OG_IMAGE_TYPE,
      ogUrl: shareUrl,
      twitterUrl: shareUrl,
      twitterDomain: shareHost,
      locale: customer?.locale ?? "km_KH",
      ogType: "website",
      updatedTime: new Date().toISOString(),
    },
  };
}

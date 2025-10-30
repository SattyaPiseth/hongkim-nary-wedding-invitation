import { findCustomerByUuid, isValidUuidFormat } from "../lib/customers";

const abs = (origin, path = "/") => {
  try {
    return new URL(path, origin).href;
  } catch {
    return path;
  }
};

export async function coverLoader({ params, request }) {
  const { uuid } = params || {};
  const origin = import.meta?.env?.VITE_SITE_URL || new URL(request.url).origin;

  // Public (index) route → generic, indexable
  if (!uuid) {
    return {
      isValidInvite: false,
      customer: null,
      indexable: true,
      seo: {
        title: "Hongkim & Nary Wedding — Save the Date",
        description:
          "Join us in celebrating love. Ceremony details, schedule, map, and RSVP.",
        canonical: abs(origin, "/"),
        image: "/images/seo/hongkim-nary.webp",
        locale: "en_US",
        ogType: "website",
        updatedTime: new Date().toISOString(),
      },
    };
  }

  // ❌ Minimal change: do NOT redirect; show soft not-found (noindex + canonical to public)
  if (!isValidUuidFormat(uuid)) {
    return {
      isValidInvite: false,
      customer: null,
      indexable: false,
      seo: {
        title: "Invitation not found",
        description: "This invite link is invalid or has expired.",
        canonical: abs(origin, "/"), // <- canonical to public page
        image: "/images/seo/hongkim-nary.webp",
        locale: "en_US",
        ogType: "website",
        updatedTime: new Date().toISOString(),
      },
    };
  }

  const customer = findCustomerByUuid(uuid);

  // Not found → non-indexable soft 404 (canonical to public)
  if (!customer) {
    return {
      isValidInvite: false,
      customer: null,
      indexable: false,
      seo: {
        title: "Invitation not found",
        description: "This invite link is invalid or has expired.",
        canonical: abs(origin, "/"), // <- canonical to public page
        image: "/images/seo/hongkim-nary.webp",
        locale: "en_US",
        ogType: "website",
        updatedTime: new Date().toISOString(),
      },
    };
  }

  // ✅ Minimal change: UUID pages are ALWAYS non-indexable + generic SEO (no JSON-LD)
  return {
    isValidInvite: true,
    customer,
    indexable: false,
    seo: {
      title: "Invitation",
      description: "Private invitation for the ceremony.",
      canonical: abs(origin, "/"), // <- canonical to public page
      image: customer?.coverImageUrl ?? "/images/seo/hongkim-nary.webp",
      locale: customer?.locale ?? "km_KH",
      ogType: "website",
      updatedTime: new Date().toISOString(),
    },
  };
}

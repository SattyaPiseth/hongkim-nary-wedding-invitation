import customers from "../data/json/customer.json";

export function isValidUuidFormat(s) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}

const EVENT_ISO = import.meta.env.VITE_EVENT_DATE || undefined;
const EVENT_HUMAN = EVENT_ISO
  ? new Date(EVENT_ISO).toLocaleDateString("km-KH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Phnom_Penh"
    })
  : "Save the Date";

// Defaults for SEO/Event schema
const DEFAULTS = {
  coupleName: "Phaneth & Thamony Wedding",
  coverImageUrl: "/images/seo/phaneth-thamony-logo.avif",
  locationShort: "Phnom Penh",
  locationFull: "Phnom Penh, Cambodia",
  locale: "km_KH",
  isPublic: true,
  isExpired: false,
  dateISO: EVENT_ISO,
  dateHuman: EVENT_HUMAN,
};

// Normalize JSON data
const CUSTOMERS = customers.map((row) => ({
  uuid: row.uuid,
  guestName: row.full_name,

  coupleName: DEFAULTS.coupleName,
  coverImageUrl: DEFAULTS.coverImageUrl,
  locationShort: DEFAULTS.locationShort,
  locationFull: DEFAULTS.locationFull,
  locale: DEFAULTS.locale,
  isPublic: DEFAULTS.isPublic,
  isExpired: DEFAULTS.isExpired,
  dateISO: DEFAULTS.dateISO,
  dateHuman: DEFAULTS.dateHuman,
}));

export function findCustomerByUuid(uuid) {
  if (!uuid || !isValidUuidFormat(uuid)) return null;
  return CUSTOMERS.find((c) => c.uuid.toLowerCase() === uuid.toLowerCase()) || null;
}

export { CUSTOMERS as __CUSTOMERS_INTERNAL };

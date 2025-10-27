// pages/api/wishes.js
// Append-only writes: one file per wish. GET aggregates via list().

import { list, put } from "@vercel/blob";

// ===== Config =====
const PREFIX = "wishes/items/";            // per-item files live here
const LEGACY_AGG = "wishes/wishes.json";   // optional legacy single-file path (read-only fallback)
const token = process.env.STAGE-NARY-HONGKIM; // ensure set in the right Vercel env
const PUBLIC_WISHES_URL = process.env.WISHES_JSON_URL || ""; // legacy public URL (optional)

// API responses are uncached (blob files can be cached; each file is immutable)
const API_NO_CACHE = "no-store, no-cache, must-revalidate";

// Basic per-instance anti-spam
const POST_MAX_PER_IP_PER_MIN = 6;
const ipCounters = new Map();

// ===== Helpers =====
function rateLimitOk(ip = "unknown") {
  const now = Date.now();
  const rec = ipCounters.get(ip);
  if (!rec || now - rec.ts > 60_000) {
    ipCounters.set(ip, { count: 1, ts: now });
    return true;
  }
  if (rec.count >= POST_MAX_PER_IP_PER_MIN) return false;
  rec.count++;
  return true;
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  try { return JSON.parse(raw); }
  catch {
    const e = new Error("INVALID_JSON");
    e.status = 400;
    throw e;
  }
}

function makeId() {
  return (typeof crypto !== "undefined" && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function validateWish(input) {
  let { name, message } = input || {};
  name = String(name ?? "").trim();
  message = String(message ?? "").trim();

  if (name.length < 1 || message.length < 1) {
    const e = new Error("Name and message required");
    e.status = 400;
    throw e;
  }
  if (name.length > 120 || message.length > 2000) {
    const e = new Error("Payload too large");
    e.status = 413;
    throw e;
  }
  return {
    id: makeId(),
    name,
    message,
    createdAt: new Date().toISOString(),
  };
}

// Legacy one-time read (if no per-item files exist yet)
async function tryLoadLegacy() {
  const url =
    PUBLIC_WISHES_URL ||
    (await (async () => {
      try {
        const { blobs } = await list({ prefix: LEGACY_AGG, token });
        const found = blobs.find((b) => b.pathname === LEGACY_AGG);
        return found?.url || "";
      } catch { return ""; }
    })());
  if (!url) return [];
  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) return [];
    const data = await r.json();
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

// Fetch JSON with small concurrency limit
async function fetchAllJson(urls, limit = 8) {
  if (!urls || urls.length === 0) return [];
  const out = [];
  let i = 0;
  async function worker() {
    while (i < urls.length) {
      const idx = i++;
      const url = urls[idx];
      try {
        const r = await fetch(url, { cache: "no-store" });
        if (r.ok) {
          const j = await r.json();
          if (j) out.push(j);
        }
      } catch { /* ignore broken items */ }
    }
  }
  const workers = Array.from({ length: Math.min(limit, urls.length) }, worker);
  await Promise.all(workers);
  return out;
}

// GET: list items (paginated)
async function listWishesPaginated({ cursor, limit = 100 }) {
  const resp = await list({ prefix: PREFIX, cursor, limit, token });
  const urls = resp.blobs.map((b) => b.url);

  const items = await fetchAllJson(urls, 8);

  items.sort((a, b) => {
    const ta = Date.parse(a?.createdAt || 0) || 0;
    const tb = Date.parse(b?.createdAt || 0) || 0;
    return tb - ta;
  });

  return { items, nextCursor: resp.cursor || null };
}

// ===== API handler =====
export default async function handler(req, res) {
  try {
    if (!token) {
      res.setHeader("Cache-Control", API_NO_CACHE);
      return res.status(500).json({
        error: "CONFIG",
        message: "Missing PHANETH_THAMONY_READ_WRITE_TOKEN",
      });
    }

    const method = req.method || "GET";

    // -------- GET: list wishes (paginated) --------
    if (method === "GET") {
      const q = req.query || {};
      const limitRaw  = typeof q.limit  === "string" ? q.limit  : Array.isArray(q.limit)  ? q.limit[0]  : undefined;
      const cursorRaw = typeof q.cursor === "string" ? q.cursor : Array.isArray(q.cursor) ? q.cursor[0] : undefined;

      const limit  = Math.max(1, Math.min(500, parseInt(limitRaw || "100", 10) || 100));
      const cursor = cursorRaw || undefined;

      let { items } = await listWishesPaginated({ cursor, limit });

      // If empty and first page, try legacy (bootstrap visibility)
      if (!cursor && items.length === 0) {
        items = await tryLoadLegacy();
      }

      res.setHeader("Cache-Control", API_NO_CACHE);
      // Return an array so your frontend .map() works unchanged
      return res.status(200).json(items);
      // If you want pagination later: return res.status(200).json({ items, nextCursor });
    }

    // -------- POST: append one wish (append-only) --------
    if (method === "POST") {
      const ip =
        (req.headers["x-forwarded-for"] || "").toString().split(",")[0].trim() ||
        (req.socket && req.socket.remoteAddress) ||
        "unknown";
      if (!rateLimitOk(ip)) {
        res.setHeader("Cache-Control", API_NO_CACHE);
        return res.status(429).json({ error: "RATE_LIMIT", message: "Too many requests" });
      }

      const ct = String(req.headers["content-type"] || "").toLowerCase();
      if (!ct.includes("application/json")) {
        res.setHeader("Cache-Control", API_NO_CACHE);
        return res.status(415).send("Unsupported Media Type");
      }

      const body = await readJsonBody(req);
      const item = validateWish(body);

      const ts = Date.now();
      const key = `${PREFIX}${ts}-${item.id}.json`;

      await put(key, JSON.stringify(item), {
        access: "public",
        contentType: "application/json; charset=utf-8",
        addRandomSuffix: false, // key already unique
        allowOverwrite: false,  // NEVER overwrite → race-proof
        token,
        // cacheControlMaxAge: 31536000, // optional: long cache for immutable per-item files
      });

      res.setHeader("Cache-Control", API_NO_CACHE);
      return res.status(200).json(item);
    }

    res.setHeader("Allow", "GET, POST");
    res.setHeader("Cache-Control", API_NO_CACHE);
    return res.status(405).end("Method Not Allowed");
  } catch (err) {
    const status = err.status || 500;
    const payload = {
      error: "INTERNAL_ERROR",
      stage: err.stage || "UNKNOWN",
      message: err.message || String(err),
    };
    console.error("wishes API error:", payload);
    res.setHeader("Cache-Control", API_NO_CACHE);
    return res.status(status).json(payload);
  }
}

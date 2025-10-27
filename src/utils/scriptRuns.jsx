import React from "react";

/** Decide if a grapheme is Khmer using Unicode Script property */
const KHMER_RE = /\p{Script=Khmer}/u;
/** "Neutral" chars: spaces, punctuation, symbols, digits, controls, etc. */
const NEUTRAL_RE = /^[\p{Z}\p{P}\p{S}\p{N}\p{C}]+$/u;

/** Iterate string by grapheme clusters (falls back to Array.from) */
function* iterGraphemes(str) {
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    const seg = new Intl.Segmenter("km", { granularity: "grapheme" });
    for (const { segment } of seg.segment(str)) yield segment;
  } else {
    // Best-effort fallback
    yield* Array.from(str);
  }
}

/**
 * Split text into runs by script (Khmer vs non-Khmer),
 * neutrals inherit the current run when possible.
 * @returns Array<{ text: string, kh: boolean | null }>
 * kh=null means the run is purely neutral (at the very start, e.g. leading spaces)
 */
export function splitRunsByScript(str = "") {
  const runs = [];
  let buf = "";
  let kh = null;            // current run script: true (Khmer) | false (Latin/Other) | null (neutral start)
  let lastNonNeutral = null; // remember last non-neutral script for neutrals to inherit

  const flush = (nextKh) => {
    if (!buf) return;
    runs.push({ text: buf, kh });
    buf = "";
    kh = nextKh;
  };

  for (const g of iterGraphemes(str)) {
    const isNeutral = NEUTRAL_RE.test(g);
    const isKh = !isNeutral && KHMER_RE.test(g);
    const nextKh = isNeutral ? kh ?? lastNonNeutral : isKh;

    // Start or continue same kind
    if (kh === null) {
      // starting run
      kh = nextKh;
      buf = g;
    } else if (nextKh === kh) {
      buf += g;
    } else {
      flush(nextKh);
      buf = g;
    }

    if (!isNeutral) lastNonNeutral = isKh;
  }

  if (buf) runs.push({ text: buf, kh });
  return runs;
}

/**
 * Render mixed Khmer/Latin with dedicated classes.
 * @param {string} name
 * @param {{
 *   khmerClass?: string,
 *   latinClass?: string,
 *   neutralClass?: string, // used when kh=null after splitting (rare: all-neutral)
 *   latinLang?: string,
 *   khmerLang?: string
 * }} opts
 */
export function renderNameWithFonts(
  name = "",
  {
    khmerClass = "moul-regular",            // define in CSS to map to 'Moul' or 'Moulpali'
    latinClass = "font-celinda font-semibold text-base", // or "font-merriweather"
    neutralClass = "",                      // optional styling for pure-neutral runs
    latinLang = "en",
    khmerLang = "km",
  } = {}
) {
  const runs = splitRunsByScript(name);
  if (runs.length === 0) return null;

  // If the whole string is one script, render as a single span
  if (runs.length === 1) {
    const { text, kh } = runs[0];
    const cls =
      kh === true ? khmerClass : kh === false ? latinClass : neutralClass;
    const lang = kh === true ? khmerLang : latinLang;
    return (
      <span lang={lang} className={cls}>
        {text}
      </span>
    );
  }

  // Multi-run render
  let keyCounter = 0;
  return (
    <>
      {runs.map(({ text, kh }) => {
        const lang = kh === true ? khmerLang : latinLang;
        const cls =
          kh === true ? khmerClass : kh === false ? latinClass : neutralClass;
        const key = `${kh === true ? "km" : kh === false ? "la" : "ne"}-${keyCounter++}`;
        return (
          <span key={key} lang={lang} className={cls}>
            {text}
          </span>
        );
      })}
    </>
  );
}

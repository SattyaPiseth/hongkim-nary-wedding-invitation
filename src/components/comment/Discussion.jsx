import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { CommentSection } from "./CommentSection.jsx";

/* Utils */
function formatDate(dateLike) {
  const d = dateLike instanceof Date ? dateLike : new Date(dateLike);
  return d
    .toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    .replace(/([A-Za-z]{3}) /, "$1. ");
}
function hueFromString(s = "") {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
}

/* UI bits */
function Avatar({ name }) {
  const h = hueFromString(name);
  const initial = (name || "G").trim().slice(0, 1).toUpperCase();
  return (
    <div
      className="grid size-9 place-items-center rounded-full text-white text-sm font-semibold shadow-sm"
      style={{ background: `hsl(${h} 70% 50% / 0.9)` }}
      aria-hidden="true"
    >
      {initial}
    </div>
  );
}

const WishItem = React.memo(function WishItem({ wish, indexFromNewest, highlight }) {
  return (
    <li
      className={[
        "group rounded-xl border border-white/60 bg-white/70",
        "shadow-sm hover:shadow-md transition",
        highlight ? "ring-2 ring-pink-300/60" : "ring-0",
      ].join(" ")}
    >
      <article className="p-4 text-base siemreap-regular">
        <header className="flex items-center gap-3 mb-1">
          <Avatar name={wish.author.name} />
          <div className="flex min-w-0 flex-col">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold text-gray-900 p-0.5">
                {wish.author.name}
              </p>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/5 text-gray-600">
                #{indexFromNewest}
              </span>
            </div>
            <time className="text-xs text-gray-500" dateTime={new Date(wish.createdAt).toISOString()}>
              {formatDate(wish.createdAt)}
            </time>
          </div>
        </header>
        <p className="mt-2 text-gray-800 leading-relaxed text-sm whitespace-pre-wrap break-words">
          {wish.content}
        </p>
      </article>
    </li>
  );
});

/* Main */
export default function Discussion() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flashId, setFlashId] = useState(null);
  const [error, setError] = useState("");

  const listRef = useRef(null);
  const [topShadow, setTopShadow] = useState(false);
  const [botShadow, setBotShadow] = useState(false);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setError("");
        const res = await fetch("/api/wishes", { signal: ac.signal });
        if (!res.ok) throw new Error("Failed to load wishes");
        const data = await res.json();
        const list = (data || [])
          .map((w) => ({
            id: String(w.id),
            author: { name: w.name || "Guest" },
            content: w.message,
            createdAt: w.createdAt,
          }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setComments(list);
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error(e);
          setError(e.message || "Something went wrong loading wishes.");
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  const updateShadows = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    setTopShadow(el.scrollTop > 2);
    setBotShadow(el.scrollTop + el.clientHeight < el.scrollHeight - 2);
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    updateShadows();
    el.addEventListener("scroll", updateShadows, { passive: true });
    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(updateShadows);
      ro.observe(el);
    }
    return () => {
      el.removeEventListener("scroll", updateShadows);
      ro?.disconnect();
    };
  }, [comments.length, updateShadows]);

  const handleSubmit = useCallback(async ({ name, message }) => {
    try {
      setError("");
      const res = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message }),
      });
      if (!res.ok) throw new Error((await res.text()) || "Failed to save wish");

      const saved = await res.json();
      const newItem = {
        id: String(saved.id),
        author: { name: saved.name || "Guest" },
        content: saved.message,
        createdAt: saved.createdAt,
      };

      setComments((prev) => [newItem, ...prev]);

      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

      requestAnimationFrame(() => {
        listRef.current?.scrollTo({
          top: 0,
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });
        setFlashId(newItem.id);
        setTimeout(() => setFlashId(null), 1200);
      });
    } catch (e) {
      console.error(e);
      setError(e.message || "Could not send your wish, please try again.");
    }
  }, []);

  const countText = comments.length === 1 ? "1 wish" : `${comments.length} wishes`;

  return (
    <section className="bg-transparent py-8 lg:py-16 antialiased" data-aos="fade-up">
      <div className="max-w-2xl mx-auto">
        <CommentSection onSubmit={handleSubmit} />

        {error && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-8" data-aos="zoom-out">
          <div className="relative rounded-2xl border border-white/30 bg-white/40 shadow-xl backdrop-blur-xl ring-1 ring-black/5">
            {/* Sticky header */}
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 py-3 rounded-t-2xl bg-gradient-to-b from-white/70 to-white/30 border-b border-white/40 backdrop-blur-xl">
              <h3 className="font-semibold text-gray-900 siemreap-regular">
                Greetings
              </h3>
              <span className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full bg-black/5 text-gray-700">
                {countText}
              </span>
            </div>

            {/* Scroll fade hints */}
            {topShadow && (
              <div className="pointer-events-none absolute left-0 right-0 top-[48px] h-4 bg-gradient-to-b from-black/5 to-transparent rounded-t-2xl" />
            )}
            {botShadow && (
              <div className="pointer-events-none absolute left-0 right-0 bottom-0 h-8 bg-gradient-to-t from-black/10 to-transparent rounded-b-2xl" />
            )}

            {/* Live region so SR users hear new items */}
            <div aria-live="polite">
              <div
                ref={listRef}
                className="max-h-[28rem] lg:max-h-[36rem] overflow-y-auto overscroll-contain px-3 py-4 [scrollbar-gutter:stable]"
                style={{ WebkitOverflowScrolling: "touch", scrollBehavior: "smooth" }}
                aria-label="Guest wishes"
              >
                {loading ? (
                  <p className="px-2 py-4 text-gray-500">Loading…</p>
                ) : comments.length === 0 ? (
                  <p className="px-2 py-4 text-gray-500">No comments yet. Be the first!</p>
                ) : (
                  <ul className="space-y-3">
                    {comments.map((c, idx) => (
                      <WishItem
                        key={c.id}
                        wish={c}
                        indexFromNewest={comments.length - idx}
                        highlight={flashId === c.id}
                      />
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <p className="mt-3 text-center text-xs text-gray-500">
            💡 Scroll to see earlier wishes.
          </p>
        </div>
      </div>
    </section>
  );
}

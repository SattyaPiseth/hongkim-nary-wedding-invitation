import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useRef, useState, useEffect, useCallback, lazy, Suspense } from "react";
import Seo19 from "./components/Seo19.jsx";
import VideoLayer from "./components/video/VideoLayer.jsx";

// Lazy-load non-critical UI to reduce TBT on first paint
const Overlay = lazy(() => import("./components/base/Overlay.jsx"));
const PlayMusic = lazy(() => import("./components/PlayMusic.jsx"));

const STORY_VIDEOS = ["/videos/home.webm"];
const BGMUSIC = "/audio/special-someone-audio.mp3";

const DEFAULT_BG = {
  src: "/videos/background.webm", // videos/homepage-background.mp4
  poster: "/images/cover-page/background.webp",
  loop: true,
};

const BG_BY_ROUTE = {
  "/": { src: "/videos/background.webm", poster: "/images/cover-page/background.webp", loop: true },
  "/home": { src: "/videos/background.webm", poster: "/images/cover-page/background.webp", loop: true }, // videos/homepage-background.mp4
};

// --- Detect UUID-like or invitation routes ---
const isUuidPath = (p) => {
  const normalized = p !== "/" && p.endsWith("/") ? p.slice(0, -1) : p;
  // Root-level UUID, e.g. /123e4567-e89b-12d3-a456-426614174000
  const uuidRoot = /^\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(normalized);
  // Optional extra patterns like /invite/<uuid> or /guest/<id>
  const inviteLike = /^\/(invite|guest)\/[A-Za-z0-9-]{6,}$/.test(normalized);
  return uuidRoot || inviteLike;
};

// --- Background picker ---
const pickRouteBg = (pathname) => {
  if (BG_BY_ROUTE[pathname]) return BG_BY_ROUTE[pathname];
  if (isUuidPath(pathname)) {
    // 👇 This is the video you want for your UUID route
    return { src: "/videos/background.webm", poster: "/images/cover-page/background.webp", loop: true };
  }
  return DEFAULT_BG;
};



export default function App() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const audioRef = useRef(null);
  const videoRef = useRef(null);

  // AOS refs
  const aosRef = useRef(null);
  const aosReadyRef = useRef(false);

  // App state
  const [mode, setMode] = useState("background"); // 'background' | 'story'
  const [storyIndex, setStoryIndex] = useState(-1);
  const [unlocked, setUnlocked] = useState(false);
  const [allowAudio, setAllowAudio] = useState(false);

  // Defer background video src until idle/interaction (protect LCP)
  const [bgSrcReady, setBgSrcReady] = useState(false);

  // Persisted mute preference
  const [muted, setMuted] = useState(() => {
    try {
      return typeof window !== "undefined" && localStorage.getItem("bgMuted") === "1";
    } catch {
      return false;
    }
  });

  // Background management
  // const routeBg = BG_BY_ROUTE[pathname] ?? DEFAULT_BG;
  const routeBg = pickRouteBg(pathname);
  const [bgOverride, setBgOverride] = useState(null);
  const effectiveBg = bgOverride ?? routeBg;

  const setBackground = useCallback(
    (next) =>
      setBgOverride((prev) => {
        const base = prev ?? routeBg;
        return { ...base, ...next, poster: next?.poster ?? base.poster };
      }),
    [routeBg]
  );
  const resetBackground = useCallback(() => setBgOverride(null), []);

  // Smooth volume ramp
  const fadeTo = useCallback(async (target = 1, ms = 400) => {
    const a = audioRef.current;
    if (!a) return;
    const steps = Math.max(2, Math.floor(ms / 25));
    const start = a.volume ?? 1;
    const step = (target - start) / steps;
    for (let i = 0; i < steps; i++) {
      a.volume = Math.min(1, Math.max(0, (a.volume ?? start) + step));
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, ms / steps));
    }
  }, []);

  // Prime audio on user gesture (idempotent)
  const primeAudio = useCallback(async () => {
    if (unlocked) return;
    const a = audioRef.current;
    if (!a) return;
    try {
      const prevVol = a.volume ?? 1;
      a.muted = true;
      a.volume = 0;
      await a.play(); // silent play to satisfy autoplay
      a.pause();
      a.currentTime = 0;
      a.muted = muted;
      a.volume = prevVol;
      setUnlocked(true);
    } catch {
      // needs another gesture
    }
  }, [unlocked, muted]);

  // One-time unlock on first interaction (also mark bg video ready)
  useEffect(() => {
    const onFirstInteract = () => {
      primeAudio();
      setBgSrcReady(true);
    };
    window.addEventListener("pointerdown", onFirstInteract, { once: true, passive: true });
    window.addEventListener("keydown", onFirstInteract, { once: true });
    return () => {
      window.removeEventListener("pointerdown", onFirstInteract);
      window.removeEventListener("keydown", onFirstInteract);
    };
  }, [primeAudio]);

  // Mark bg ready on idle (in case there was no interaction yet)
  useEffect(() => {
    const rIC = window.requestIdleCallback || ((cb) => setTimeout(cb, 500));
    const id = rIC(() => setBgSrcReady(true));
    // no need to cancel for setTimeout fallback; requestIdleCallback cancel is optional
    return () => {};
  }, []);

  // ✅ AOS: lazy-load lib, defer init to next frame, then extra refreshHard
  useEffect(() => {
    const loadAOS = async () => {
      // 🟩 Dynamically inject the AOS CSS (defer from first paint)
      if (!document.getElementById("aos-css")) {
        const link = document.createElement("link");
        link.id = "aos-css";
        link.rel = "stylesheet";
        link.href = "https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.css";
        document.head.appendChild(link);
      }

      // 🟩 Then import and initialize AOS
      const AOS = (await import("aos")).default;
      AOS.init({
        once: true,
        duration: 700,
        easing: "ease-out-cubic",
      });
      // make guarded refreshers operational
      aosRef.current = AOS;
      aosReadyRef.current = true;

      // 🟩 Refresh after first paint settles
      if (window.requestIdleCallback) {
        requestIdleCallback(() => AOS.refreshHard());
      } else {
        setTimeout(() => AOS.refreshHard(), 1000);
      }
    };

    loadAOS();
  }, []);

  // refresh on route change after paint
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (aosReadyRef.current) {
        // Fix: Call refresh directly from aosRef.current instead of aosSafeRefresh
        if (aosRef.current) {
          aosRef.current.refresh();
        }
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  // Clear background override on route change
  useEffect(() => setBgOverride(null), [pathname]);

  // Enable + play immediately under same gesture
  const enableAudioNow = useCallback(async () => {
    await primeAudio();
    setAllowAudio(true);
    const a = audioRef.current;
    if (a && !muted) {
      try {
        a.muted = muted;
        await a.play();
        fadeTo(1, 250);
      } catch {}
    }
  }, [primeAudio, muted, fadeTo]);

  // Public API to start the story (also enables audio)
  const startStory = useCallback(async () => {
    await enableAudioNow();
    setStoryIndex(0);
    setMode("story");
  }, [enableAudioNow]);

  // Guard story index for safe bounds
  useEffect(() => {
    if (mode === "story" && (storyIndex < 0 || storyIndex >= STORY_VIDEOS.length)) {
      setStoryIndex(0);
    }
  }, [mode, storyIndex]);

  // Central video/audio controller
  useEffect(() => {
    if (!videoRef.current) return;
    const a = audioRef.current;

    const applyAndPlay = async (src, { loop }) => {
      const el = videoRef.current;
      if (!el) return;

      el.loop = !!loop;
      el.muted = true;
      el.setAttribute("muted", "");
      el.setAttribute("playsinline", "");
      el.srcObject = null;

      const absolute = new URL(src, window.location.origin).href;
      const same = el.currentSrc === absolute || el.src === absolute;

      if (!same) {
        el.src = src;
        await new Promise((res) => {
          const on = () => (el.removeEventListener("loadedmetadata", on), res());
          el.addEventListener("loadedmetadata", on, { once: true });
        });
      }

      try {
        await el.play();
      } catch {
        /* autoplay failures are fine */
      }
    };

    const ensureAudioPlaying = async () => {
      if (!a) return;
      a.muted = muted;
      if (allowAudio && unlocked && !muted && a.paused) {
        try {
          await a.play();
          fadeTo(1, 300);
        } catch {}
      }
    };

    if (mode === "story") {
      // Story videos should be immediate
      const src = STORY_VIDEOS[storyIndex] ?? STORY_VIDEOS[0];
      applyAndPlay(src, { loop: false });
      ensureAudioPlaying();
    } else {
      // Background video only attaches after idle/interaction
      if (bgSrcReady) {
        applyAndPlay(effectiveBg.src, { loop: effectiveBg.loop });
        ensureAudioPlaying();
      }
    }
  }, [mode, storyIndex, unlocked, muted, effectiveBg, fadeTo, allowAudio, bgSrcReady]);

  // ✅ AOS: refresh when active video stabilizes
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !aosReadyRef.current) return;

    const onLoaded = () => {
      // hide the poster once the video can paint
      const poster = document.getElementById("lcp-poster");
      if (poster) poster.style.display = "none";
      
      // Fix: Call refresh directly from aosRef.current instead of aosSafeRefresh
      if (aosRef.current) {
        aosRef.current.refresh();
      }
    };

    el.addEventListener("loadeddata", onLoaded);
    el.addEventListener("loadedmetadata", onLoaded);
    return () => {
      el.removeEventListener("loadeddata", onLoaded);
      el.removeEventListener("loadedmetadata", onLoaded);
    };
  }, [effectiveBg.src, mode, storyIndex]);

  // End-of-video only in story mode
  const handleEnded = useCallback(() => {
    if (mode !== "story") return;
    const next = storyIndex + 1;
    if (next < STORY_VIDEOS.length) {
      setStoryIndex(next);
    } else {
      setMode("background");
      setStoryIndex(0);
      if (pathname !== "/home") navigate("/home", { replace: true });
    }
  }, [mode, storyIndex, navigate, pathname]);

  // Visibility: fade/pause when hidden, resume when visible (respect allowAudio)
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onVisibility = async () => {
      if (document.hidden) {
        try {
          await fadeTo(0, 200);
        } finally {
          a.pause();
        }
      } else if (allowAudio && unlocked && !muted) {
        try {
          await a.play();
          fadeTo(1, 250);
        } catch {}
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [unlocked, muted, fadeTo, allowAudio]);

  // Pause when muted, resume when unmuted (if allowed)
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (muted) {
      a.pause();
    } else if (allowAudio) {
      a.play().catch(() => {});
    }
  }, [muted, allowAudio]);

  // iOS loop seam patch (respect allowAudio/muted)
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onEnded = () => {
      a.currentTime = 0;
      if (allowAudio && !muted) a.play().catch(() => {});
    };
    a.addEventListener("ended", onEnded);
    return () => a.removeEventListener("ended", onEnded);
  }, [allowAudio, muted]);

  // Persist mute preference
  useEffect(() => {
    const a = audioRef.current;
    if (a) a.muted = muted;
    try {
      localStorage.setItem("bgMuted", muted ? "1" : "0");
    } catch {}
  }, [muted]);

  // A11y hardening: convert any aria-hidden tree with focusables to inert
  useEffect(() => {
    const hasFocusable = (el) =>
      !!el.querySelector('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])');

    const enforce = () => {
      document.querySelectorAll('[aria-hidden="true"]').forEach((el) => {
        if (hasFocusable(el)) {
          el.setAttribute('inert', '');
          el.removeAttribute('aria-hidden');
        }
      });
    };

    enforce();

    const mo = new MutationObserver(() => enforce());
    mo.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-hidden'],
    });

    return () => mo.disconnect();
  }, []);

  // Only show PlayMusic on /home and NOT during the story
  const showPlayMusic = pathname === "/home" && mode !== "story";

  return (
    <>
      {/* Site-wide SEO defaults (pages can override) */}
      <Seo19 />

      {/* Skip link for keyboard users */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:bg-white/90 focus:text-black focus:p-2 focus:rounded"
      >
        Skip to content
      </a>

      {/* Ambient music */}
      <audio ref={audioRef} src={BGMUSIC} preload="auto" loop hidden />

      {/* Background / Story video */}
      <VideoLayer
        videoRef={videoRef}
        poster={effectiveBg.poster}
        onEnded={mode === "story" ? handleEnded : undefined}
      />

      <Suspense fallback={null}>
        <Overlay />
      </Suspense>

      {showPlayMusic && (
        <Suspense fallback={null}>
          <PlayMusic
            allowAudio={allowAudio}
            setAllowAudio={setAllowAudio}
            muted={muted}
            setMuted={setMuted}
            onEnableAudio={enableAudioNow}
          />
        </Suspense>
      )}

      {/* Children get the small API */}
      <main id="main" className="relative z-20">
        <Outlet
          context={{
            mode,
            startStory,
            setBackground,
            resetBackground,
            setAllowAudio,
            allowAudio,
            muted,
            setMuted,
          }}
        />
      </main>
    </>
  );
}

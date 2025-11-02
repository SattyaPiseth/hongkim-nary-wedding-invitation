import { Outlet, useLocation, useNavigate, useNavigation } from "react-router-dom";
import { useRef, useState, useEffect, useCallback, lazy, Suspense } from "react";
import Seo19 from "./components/Seo19.jsx";
import VideoLayer from "./components/video/VideoLayer.jsx";

const Overlay = lazy(() => import("./components/base/Overlay.jsx"));
const PlayMusic = lazy(() => import("./components/PlayMusic.jsx"));

const toVideoSources = (webmPath, mp4Path) => [
  { src: webmPath, type: "video/webm" },
  ...(mp4Path ? [{ src: mp4Path, type: "video/mp4" }] : []),
];

const STORY_VIDEOS = [
  {
    src: "/videos/home.webm",
    sources: toVideoSources("/videos/home.webm", "/videos/home.mp4"),
  },
];
const BGMUSIC = "/audio/beautiful-in-white.mp3";

const DEFAULT_BG = {
  src: "/videos/background.webm",
  sources: toVideoSources("/videos/background.webm", "/videos/background.mp4"),
  poster: "/images/cover-page/background.webp",
  loop: true,
};

const BG_BY_ROUTE = {
  "/": {
    src: "/videos/background.webm",
    sources: toVideoSources("/videos/background.webm", "/videos/background.mp4"),
    poster: "/images/cover-page/background.webp",
    loop: true,
  },
  "/home": {
    src: "/videos/background.webm",
    sources: toVideoSources("/videos/background.webm", "/videos/background.mp4"),
    poster: "/images/cover-page/background.webp",
    loop: true,
  },
};

const isUuidPath = (p) => {
  const normalized = p !== "/" && p.endsWith("/") ? p.slice(0, -1) : p;
  const uuidRoot = /^\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(normalized);
  const inviteLike = /^\/(invite|guest)\/[A-Za-z0-9-]{6,}$/.test(normalized);
  return uuidRoot || inviteLike;
};

const pickRouteBg = (pathname) => {
  if (BG_BY_ROUTE[pathname]) return BG_BY_ROUTE[pathname];
  if (isUuidPath(pathname)) {
    return {
      src: "/videos/background.webm",
      sources: toVideoSources("/videos/background.webm", "/videos/background.mp4"),
      poster: "/images/cover-page/background.webp",
      loop: true,
    };
  }
  return DEFAULT_BG;
};

export default function App() {
  const navigation = useNavigation();
  const isRouting = navigation.state === "loading" || navigation.state === "submitting";

   // Prefetch HomePage when story begins (so /home is instant later)
   const preloadHome = useCallback(() => import("./pages/HomePage.jsx"), []);


  const navigate = useNavigate();
  const { pathname } = useLocation();

  const audioRef = useRef(null);
  const videoRef = useRef(null);

  const aosRef = useRef(null);
  const aosReadyRef = useRef(false);

  const [mode, setMode] = useState("background");
  const [storyIndex, setStoryIndex] = useState(-1);
  const [unlocked, setUnlocked] = useState(false);
  const [allowAudio, setAllowAudio] = useState(false);

  const [bgSrcReady, setBgSrcReady] = useState(false);
  const [bgPainted, setBgPainted] = useState(false); // 🆕 signal for routes
  const lastAppliedSrcRef = useRef(null);


  const [muted, setMuted] = useState(() => {
    try { return typeof window !== "undefined" && localStorage.getItem("bgMuted") === "1"; }
    catch { return false; }
  });

  const routeBg = pickRouteBg(pathname);
  const [bgOverride, setBgOverride] = useState(null);
  const effectiveBg = bgOverride ?? routeBg;

  const setBackground = useCallback(
    (next) => setBgOverride((prev) => {
      const base = prev ?? routeBg;
      return { ...base, ...next, poster: next?.poster ?? base.poster };
    }),
    [routeBg]
  );
  const resetBackground = useCallback(() => setBgOverride(null), []);

  const fadeTo = useCallback(async (target = 1, ms = 400) => {
    const a = audioRef.current;
    if (!a) return;
    const steps = Math.max(2, Math.floor(ms / 25));
    const start = a.volume ?? 1;
    const step = (target - start) / steps;
    for (let i = 0; i < steps; i++) {
      a.volume = Math.min(1, Math.max(0, (a.volume ?? start) + step));
      await new Promise((r) => setTimeout(r, ms / steps));
    }
  }, []);

  const primeAudio = useCallback(async () => {
    if (unlocked) return;
    const a = audioRef.current;
    if (!a) return;
    try {
      const prevVol = a.volume ?? 1;
      a.muted = true;
      a.volume = 0;
      await a.play();
      a.pause();
      a.currentTime = 0;
      a.muted = muted;
      a.volume = prevVol;
      setUnlocked(true);
    } catch {}
  }, [unlocked, muted]);

  useEffect(() => {
    const onFirstInteract = () => { primeAudio(); setBgSrcReady(true); };
    window.addEventListener("pointerdown", onFirstInteract, { once: true, passive: true });
    window.addEventListener("keydown", onFirstInteract, { once: true });
    return () => {
      window.removeEventListener("pointerdown", onFirstInteract);
      window.removeEventListener("keydown", onFirstInteract);
    };
  }, [primeAudio]);

  useEffect(() => {
    const rIC = window.requestIdleCallback || ((cb) => setTimeout(cb, 500));
    rIC(() => setBgSrcReady(true));
    return () => {};
  }, []);

  // AOS lazy init (✅ optional: import CSS via Vite)
  useEffect(() => {
    const loadAOS = async () => {
      try {
        await import("aos/dist/aos.css");
        const AOS = (await import("aos")).default;
        AOS.init({ once: true, duration: 700, easing: "ease-out-cubic" });
        aosRef.current = AOS;
        aosReadyRef.current = true;

        if (window.requestIdleCallback) {
          requestIdleCallback(() => AOS.refreshHard(), { timeout: 1000 });
        } else {
          setTimeout(() => AOS.refreshHard(), 1000);
        }
      } catch (e) {
        // Don’t block the app if AOS fails to load
        console.error("AOS load failed:", e);
      }
    };
    loadAOS();
  }, []);


  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (aosReadyRef.current && aosRef.current) aosRef.current.refresh();
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  useEffect(() => setBgOverride(null), [pathname]);

  const enableAudioNow = useCallback(async () => {
    await primeAudio();
    setAllowAudio(true);
    const a = audioRef.current;
    if (a && !muted) {
      try { a.muted = muted; await a.play(); fadeTo(1, 250); } catch {}
    }
  }, [primeAudio, muted, fadeTo]);

  const startStory = useCallback(async () => {
    await enableAudioNow();
    setStoryIndex(0);
    setMode("story");
    preloadHome();
  }, [enableAudioNow, preloadHome]);

  useEffect(() => {
    if (mode === "story" && (storyIndex < 0 || storyIndex >= STORY_VIDEOS.length)) setStoryIndex(0);
  }, [mode, storyIndex]);

  useEffect(() => {
    if (!videoRef.current) return;
    const a = audioRef.current;

    const normalizeSourceSet = (descriptor) => {
      if (!descriptor) return [];
      if (Array.isArray(descriptor)) return descriptor;
      if (typeof descriptor === "string") return [descriptor];
      if (Array.isArray(descriptor.sources)) return descriptor.sources;
      if (descriptor.src) return [descriptor.src];
      return [];
    };

    const toSourceObject = (entry) => {
      if (!entry) return null;
      if (typeof entry === "string") return { src: entry };
      if (entry.src) return entry;
      return null;
    };

    const pickPlayableSource = (el, descriptor) => {
      const candidates = normalizeSourceSet(descriptor).map(toSourceObject).filter(Boolean);
      if (!candidates.length) return null;
      if (!el?.canPlayType) return candidates[0];

      for (const candidate of candidates) {
        if (!candidate.src) continue;
        if (!candidate.type) return candidate;
        const support = el.canPlayType(candidate.type);
        if (support === "probably" || support === "maybe") return candidate;
      }

      return candidates.find((candidate) => candidate.src) ?? null;
    };

    const applyAndPlay = async (descriptor, { loop }) => {
      const el = videoRef.current;
      if (!el) return;

      el.loop = !!loop;
      el.muted = true;
      el.setAttribute("muted", "");
      el.setAttribute("playsinline", "");
      el.srcObject = null;

      const chosen = pickPlayableSource(el, descriptor);
      if (!chosen?.src) return;

      const absolute = new URL(chosen.src, window.location.origin).href;
      const same = el.currentSrc === absolute || el.src === absolute;

      // Reset only when the src actually changes
      if (!same && lastAppliedSrcRef.current !== absolute) {
        setBgPainted(false);                // <- reset here
        lastAppliedSrcRef.current = absolute;
      }

      if (!same) {
        el.src = chosen.src;
        await new Promise((res) => {
          const on = () => (el.removeEventListener("loadedmetadata", on), res());
          el.addEventListener("loadedmetadata", on, { once: true });
        });
      }
      try { await el.play(); } catch {}
    };

    const ensureAudioPlaying = async () => {
      if (!a) return;
      a.muted = muted;
      if (allowAudio && unlocked && !muted && a.paused) {
        try { await a.play(); fadeTo(1, 300); } catch {}
      }
    };

    if (mode === "story") {
      const videoDescriptor = STORY_VIDEOS[storyIndex] ?? STORY_VIDEOS[0];
      applyAndPlay(videoDescriptor, { loop: false });
      ensureAudioPlaying();
    } else if (bgSrcReady) {
      applyAndPlay(effectiveBg, { loop: effectiveBg.loop });
      ensureAudioPlaying();
    }
  }, [mode, storyIndex, unlocked, muted, effectiveBg, fadeTo, allowAudio, bgSrcReady]);


  // ✅ When the active video can actually paint → mark bgPainted
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const onLoaded = () => {
      // hide poster (optional)
      const poster = document.getElementById("lcp-poster");
      if (poster) poster.style.display = "none";

      // flip the ready flag regardless of AOS status
      setBgPainted(true);

      // refresh AOS only if it's ready
      if (aosReadyRef.current && aosRef.current) {
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

  const handleEnded = useCallback(() => {
    if (mode !== "story") return;
    const next = storyIndex + 1;
    if (next < STORY_VIDEOS.length) setStoryIndex(next);
    else {
      // navigate first to avoid any intermediate CoverPage paint
      if (pathname !== "/home") navigate("/home", { replace: true });
      setMode("background");
      setStoryIndex(0);
    }
  }, [mode, storyIndex, navigate, pathname]);

  useEffect(() => {
    const a = audioRef.current; if (!a) return;
    const onVisibility = async () => {
      if (document.hidden) { try { await fadeTo(0, 200); } finally { a.pause(); } }
      else if (allowAudio && unlocked && !muted) { try { await a.play(); fadeTo(1, 250); } catch {} }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [unlocked, muted, fadeTo, allowAudio]);

  useEffect(() => {
    const a = audioRef.current; if (!a) return;
    if (muted) a.pause(); else if (allowAudio) a.play().catch(() => {});
  }, [muted, allowAudio]);

  useEffect(() => {
    const a = audioRef.current; if (!a) return;
    const onEnded = () => { a.currentTime = 0; if (allowAudio && !muted) a.play().catch(() => {}); };
    a.addEventListener("ended", onEnded);
    return () => a.removeEventListener("ended", onEnded);
  }, [allowAudio, muted]);

  useEffect(() => {
    const a = audioRef.current;
    if (a) a.muted = muted;
    try { localStorage.setItem("bgMuted", muted ? "1" : "0"); } catch {}
  }, [muted]);

  // Keep your a11y hardening block if you rely on it in your app
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
    mo.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['aria-hidden'] });
    return () => mo.disconnect();
  }, []);

  const showPlayMusic = pathname === "/home" && mode !== "story";

  return (
    <>
      <Seo19 />

      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:bg-white/90 focus:text-black focus:p-2 focus:rounded">
        Skip to content
      </a>

      <audio ref={audioRef} src={BGMUSIC} preload="auto" loop hidden />

      <VideoLayer
        videoRef={videoRef}
        poster={effectiveBg.poster}
        onEnded={mode === "story" ? handleEnded : undefined}
      />

      <Suspense fallback={null}>
        <Overlay />
      </Suspense>

      {/* Global route-transition overlay */}
        {isRouting && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/10 backdrop-blur-[2px]">
          <span className="sr-only">Navigating…</span>
        </div>
      )}

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
            bgPainted, // 🆕 use this in routes to show a spinner until ready
          }}
        />
      </main>
    </>
  );
}

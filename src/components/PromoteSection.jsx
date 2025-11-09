import React, { useRef, useId, useMemo } from "react";
import { motion, useMotionValue, useTransform, useReducedMotion } from "framer-motion";
import { withAssetVersion } from "../utils/assetVersion.js";

const cn = (...a) => a.filter(Boolean).join(" ");

export default function PromoteSection({
  src = withAssetVersion("/images/memora-shine/memora-shine-end-page.png"),
  alt = "សេចក្តីអបអរសាទរ ព្រមទាំងអញ្ជើញចូលរួមក្នុងពិធី",
  caption,
  className = "",
  sizes = "(max-width: 640px) 100vw, 640px",
  width,
  height,

  enableTilt = true,
  tiltRange = 40,
  rounded = "rounded-lg",
  shadow = "shadow-lg",

  // NEW: control img shadow (use "" to remove)
  imgShadow = "shadow-sm",

  showGlow = false,
  eager = false,
}) {
  const prefersReduced = useReducedMotion();
  const captionId = useId();

  const ref = useRef(null);
  const rafRef = useRef(0);
  const rectRef = useRef(null);

  // Detect environments where hover/precise pointer exists
  const canHover = useMemo(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.matchMedia("(any-hover: hover)").matches;
    } catch {
      return false;
    }
  }, []);

  const tiltOff = prefersReduced || !enableTilt || !canHover;

  // Motion values (cheap when tiltOff)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useTransform(my, [-tiltRange, tiltRange], tiltOff ? [0, 0] : [6, -6]);
  const rotateY = useTransform(mx, [-tiltRange, tiltRange], tiltOff ? [0, 0] : [-6, 6]);

  const onEnter = () => {
    if (tiltOff || !ref.current) return;
    rectRef.current = ref.current.getBoundingClientRect();
  };

  const onMove = (e) => {
    if (tiltOff || !e.isPrimary || !rectRef.current) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const r = rectRef.current;
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const clamp = (v) => Math.max(-tiltRange, Math.min(tiltRange, v));
      mx.set(clamp(dx / 6));
      my.set(clamp(dy / 6));
    });
  };

  const onLeave = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rectRef.current = null;
    mx.set(0); my.set(0);
  };

  const use3D = !tiltOff;

  return (
    <motion.figure
      ref={ref}
      // Attach handlers only when tilt is on
      onPointerEnter={use3D ? onEnter : undefined}
      onPointerMove={use3D ? onMove : undefined}
      onPointerLeave={use3D ? onLeave : undefined}
      onPointerCancel={use3D ? onLeave : undefined}
      onPointerUp={use3D ? onLeave : undefined}
      style={{
        rotateX,
        rotateY,
        transformStyle: use3D ? "preserve-3d" : undefined,
        willChange: use3D ? "transform" : undefined,
      }}
      className={cn(
        "relative isolate mt-6 overflow-hidden bg-transparent",
        rounded,
        shadow, // empty string disables figure shadow
        "transform-gpu transition-transform duration-300 ease-out hover:scale-[1.01]",
        use3D && "[perspective:1000px]",
        className
      )}
      role="group"
      aria-label={caption || alt || "Promotion"}
      aria-describedby={caption ? captionId : undefined}
    >
      {showGlow && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-gradient-to-br from-white/40 via-white/10 to-transparent blur-2xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-gradient-to-tr from-[#f7c948]/30 via-transparent to-transparent blur-2xl"
          />
        </>
      )}

      <div
        className="relative z-10"
        style={{
          transform: use3D ? "translateZ(20px)" : undefined,
          willChange: use3D ? "transform" : undefined,
        }}
      >
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding={eager ? "sync" : "async"}
          draggable="false"
          className={cn("block h-auto w-full rounded-md select-none", imgShadow)}
          sizes={sizes}
          width={width}
          height={height}
        />

        {caption && (
          <figcaption
            id={captionId}
            className="siemreap-regular px-4 py-3 text-center text-sm sm:text-base text-black/70 dark:text-white/80"
          >
            {caption}
          </figcaption>
        )}
      </div>
    </motion.figure>
  );
}

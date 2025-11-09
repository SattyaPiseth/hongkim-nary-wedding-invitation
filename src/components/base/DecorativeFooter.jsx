import { useCallback, useEffect } from "react";
import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { withAssetVersion } from "../../utils/assetVersion.js";

const cn = (...parts) => parts.filter(Boolean).join(" ");

export const BOTTOM_FLOWER_CLASSNAMES = `
  mx-auto block h-auto w-full
  max-w-[min(100vw,_380px)]
  sm:max-w-[min(92vw,_420px)]
  md:max-w-[min(88vw,_520px)]
  lg:max-w-[min(82vw,_640px)]
  xl:max-w-[min(76vw,_760px)]
`;

const DEFAULT_DECORATIVE_SETTINGS = {
  minWidth: undefined,
  maxWidth: undefined,
  height: undefined,
  zIndex: 5,
};

const toCssSize = (value) => {
  if (value == null) return undefined;
  if (typeof value === "number") return `${value}px`;
  return value;
};

function useBottomFlowerAnimation(active = true) {
  const controls = useAnimationControls();
  const prefersReducedMotion = useReducedMotion();

  const startBreathing = useCallback(() => {
    if (prefersReducedMotion) {
      controls.start({ scale: 1, opacity: 1 });
      return;
    }
    controls.start({
      scale: [1, 1.035, 1],
      opacity: 1,
      transition: {
        duration: 4.5,
        ease: "easeInOut",
        repeat: Infinity,
      },
    });
  }, [controls, prefersReducedMotion]);

  useEffect(() => {
    if (!active) {
      controls.stop();
      return;
    }

    let isCancelled = false;
    controls.set({ opacity: 0, scale: 0.98 });
    controls
      .start({
        opacity: 1,
        scale: 1,
        transition: { duration: 0.6, ease: "easeOut" },
      })
      .then(() => {
        if (!isCancelled) startBreathing();
      })
      .catch(() => {});

    return () => {
      isCancelled = true;
    };
  }, [active, controls, startBreathing]);

  return controls;
}

export default function DecorativeFooter({
  active = true,
  size,
  src = withAssetVersion("/images/cover-page/bottom-flower.png"),
  className,
  imgClassName = BOTTOM_FLOWER_CLASSNAMES,
  ariaHidden = true,
}) {
  const controls = useBottomFlowerAnimation(active);

  if (!active) return null;

  const inlineImageStyle = {
    maxWidth: toCssSize(size?.maxWidth ?? DEFAULT_DECORATIVE_SETTINGS.maxWidth),
    minWidth: toCssSize(size?.minWidth ?? DEFAULT_DECORATIVE_SETTINGS.minWidth),
    height: toCssSize(size?.height ?? DEFAULT_DECORATIVE_SETTINGS.height),
  };

  const footerStyle = {
    zIndex: size?.zIndex ?? DEFAULT_DECORATIVE_SETTINGS.zIndex,
  };

  return (
    <footer
      className={cn("pointer-events-none fixed inset-x-0 bottom-0", className)}
      aria-hidden={ariaHidden}
      style={footerStyle}
    >
      <motion.img
        src={src}
        alt=""
        animate={controls}
        className={imgClassName}
        style={inlineImageStyle}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    </footer>
  );
}

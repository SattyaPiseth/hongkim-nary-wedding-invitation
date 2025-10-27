import { useMemo } from "react";

export default function useSrcSet(src, w) {
  return useMemo(() => {
    const widths = [320, 480, 640, 768, 1024, 1280, 1536];
    const srcset = widths
      .filter((tw) => tw <= w)
      .map((tw) => `${src}&w=${tw} ${tw}w`)
      .join(", ");
    const sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw";
    return { srcset, sizes };
  }, [src, w]);
}

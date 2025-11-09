import React from "react";

const cn = (...parts) => parts.filter(Boolean).join(" ");

const DEFAULT_SRC = "/images/cover-page/heading-cover-page.png";
const IMAGE_CLASSES = [
  "block mx-auto h-auto select-none",
  "aspect-[414/207]",
  "w-[min(68vw,300px)] translate-y-[clamp(1rem,4vw,2rem)]",
  "[@media(max-width:340px)]:-translate-y-[clamp(0.75rem,3.5vw,1.75rem)]",
  "xs:w-[min(66vw,300px)] xs:-translate-y-[clamp(2.25rem,6.5vw,3.75rem)] xs:mt-[3rem]",
  "sm:w-[min(58vw,340px)] sm:-translate-y-[clamp(3rem,7vw,4rem)] sm:m-auto",
  "md:w-[min(44vw,440px)] md:-translate-y-[clamp(2.25rem,6vw,3.5rem)] md:m-auto",
  "lg:w-[min(24vw,360px)] lg:translate-y-[clamp(2rem,3.5vw,3rem)] lg:m-auto",
  "xl:w-[min(20vw,400px)] xl:translate-y-[clamp(1.75rem,3vw,2.75rem)] xl:m-auto",
  "2xl:w-[min(20vw,480px)] 2xl:translate-y-[clamp(2.25rem,4vw,3.25rem)] 2xl:m-auto",
  "3xl:w-[min(18vw,400px)] 3xl:translate-y-[clamp(1.75rem,3vw,3.25rem)] 3xl:m-auto",
  "transform-gpu [will-change:transform]",
];

const HEADING_TEXT = "Hongkim & Nary Wedding Invitation";

export default function Heading({
  isStoryPlaying = false,
  className = "",
  src = DEFAULT_SRC,
}) {
  return (
    <header
      className={cn(
        "flex items-center justify-center tracking-wide mt-5",
        "p-4",
        "pt-[calc(var(--safe-top)+var(--pad-top-dynamic)+var(--pad-top-extra))]",
        className
      )}
    >
      <h1 className="sr-only">{HEADING_TEXT}</h1>

      {!isStoryPlaying && (
        <img
          src={src}
          alt="Cover page heading for wedding invitation"
          width={681}
          height={383}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className={cn(...IMAGE_CLASSES)}
          draggable={false}
          title="Cover page heading"
        />
      )}
    </header>
  );
}

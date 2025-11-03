import React, { useEffect, useState } from "react";
import useCustomerByUuid from "../../hook/useCustomerByUuid";
import CustomerNameInline from "../customer/CustomerNameInline";
import AnimatedActionButton from "../button/AnimatedActionButton";
import { renderNameWithFonts } from "../../utils/scriptRuns.jsx";

const cn = (...parts) => parts.filter(Boolean).join(" ");

export default function CoverSection({
  isStoryPlaying = false,
  onStart = () => {},
  customer,
}) {
  const customerFromHook = useCustomerByUuid();
  const person = customer ?? customerFromHook;
  const showPersonalized = !!person?.guestName;

  // Invisible-but-clickable button logic
  const VISIBLE_DELAY_MS = 1500; // show visually after 1.5s
  const [isVisible, setIsVisible] = useState(false);
  const [isPreclick, setIsPreclick] = useState(false);

  useEffect(() => {
    setIsPreclick(true); // clickable immediately
    const t = setTimeout(() => setIsVisible(true), VISIBLE_DELAY_MS); // visible after delay
    return () => clearTimeout(t);
  }, []);

  if (isStoryPlaying) return null;

  return (
    <section
      className={cn(
        "flex flex-col items-center justify-center",
        "text-[var(--text)] tracking-wide"
      )}
      aria-labelledby="cover-section-title"
    >
    <div
        className={cn(
          "flex flex-col items-center",
          "gap-y-8"
        )}
      >
        {showPersonalized ? (
          <>
            <p
              className={cn(
                "font-khangtapenh text-center tracking-wide",
                "leading-[1.25]",
                "text-xl",
                "text-[var(--secondary)]"
              )}
            >
              សូមគោរពអញ្ជើញ
            </p>
            <p
              className={cn(
                
                "moul-regular text-center tracking-wide leading-8",
                "text-sm text-wrap mx-[25vw]",
                "text-[var(--accent)]"
              )}
            >
              {renderNameWithFonts(person.guestName)}
            </p>
          </>
        ) : (
          <CustomerNameInline />
        )}

        <div
          className={cn(
            "mt-[calc(var(--ry)*1.25)] lg:mt-[calc(var(--ry)*0.3)] xl:mt-[calc(var(--ry)*0.25)] 2xl:mt-[calc(var(--ry)*0.30)]",
            "transition-opacity duration-700",
            isVisible ? "opacity-100" : "opacity-0"
          )}
          style={{ pointerEvents: isPreclick ? "auto" : "none" }}
        >
          <AnimatedActionButton
            onStart={onStart}
            src="/images/border-styles/border-button.png"
            variant="bare"
            withShine
            withRipple
          />
        </div>
    </div>
    </section>
  );
}

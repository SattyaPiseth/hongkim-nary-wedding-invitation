import { useEffect, useMemo, useState } from "react";

/**
 * Props:
 * - target: JS Date-compatible string or Date instance (e.g., "2025-12-31T23:59:59")
 * - ariaLabel: optional label for screen readers
 */
export default function Countdown({ target, ariaLabel }) {
  const targetTime = useMemo(
    () =>
      target instanceof Date ? target.getTime() : new Date(target).getTime(),
    [target]
  );

  const calcLeft = () => {
    const now = Date.now();
    const diff = Math.max(0, targetTime - now);

    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((diff % (60 * 1000)) / 1000);

    return { days, hours, minutes, seconds };
  };

  const [left, setLeft] = useState(calcLeft);

  useEffect(() => {
    const id = setInterval(() => setLeft(calcLeft()), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetTime]);

  const pad2 = (n) => String(n).padStart(2, "0");

  return (
    <div
      className="grid grid-flow-col auto-cols-max gap-5 text-center font-merriweather"
      role="timer"
      aria-live="polite"
      aria-label={ariaLabel}
    >
      <Unit label="days" value={left.days} />
      <Unit label="hours" value={pad2(left.hours)} />
      <Unit label="min" value={pad2(left.minutes)} />
      <Unit label="sec" value={pad2(left.seconds)} />
    </div>
  );
}

function Unit({ label, value }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-mono tabular-nums text-4xl leading-none">
        {value}
      </span>
      <span className="mt-1 text-sm uppercase tracking-wide opacity-80">
        {label}
      </span>
    </div>
  );
}

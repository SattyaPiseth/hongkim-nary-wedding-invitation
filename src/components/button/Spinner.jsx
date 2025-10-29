export default function Spinner({ label = "Loading", size = "md" }) {
  const sizeClass = { sm: "w-5 h-5", md: "w-8 h-8", lg: "w-12 h-12" }[size] || "w-8 h-8";
  return (
    <div role="status" aria-live="polite" className="inline-flex items-center">
      <span className="sr-only">{label}</span>
      <span
        className={[
          "inline-block animate-spin rounded-full border-2",
          "border-black/10 border-t-black/70",
          "dark:border-white/20 dark:border-t-white/80",
          sizeClass,
        ].join(" ")}
      />
    </div>
  );
}

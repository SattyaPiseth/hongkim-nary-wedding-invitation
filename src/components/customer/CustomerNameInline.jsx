import useCustomerByUuid from "../../hook/useCustomerByUuid";


/**
 * Renders the customer's display name inline, with your cover styles.
 * Props:
 *  - as: "h1" | "h2" | "span" (defaults to "h2")
 *  - className: extra classes to merge
 *  - fallback: what to render if no customer (default = null to hide)
 *  - field: which field to show ("full_name" by default; use "khmer_name" if you have it)
 */
export default function CustomerNameInline({
  as: Tag = "h2",
  className = "",
  fallback = null,
  field = "full_name",
}) {
  const customer = useCustomerByUuid();
  const name = customer?.[field]?.trim();

  if (!name) return fallback;

  return (
    <Tag
      role={Tag === "span" ? "heading" : undefined}
      aria-level={Tag === "span" ? 2 : undefined}
      className={[
        // Your existing typography for the name line:
        "moul-regular text-center leading-normal lg:leading-tight tracking-[0.005em]",
        "text-lg sm:text-2xl lg:text-3xl xl:text-[1.875rem] 2xl:text-[2rem]",
        "animate-[fade-up_700ms_ease-out_both] [animation-delay:360ms] motion-reduce:animate-none",
        
        className,
      ].join(" ")}
    >
      {name}
    </Tag>
  );
}

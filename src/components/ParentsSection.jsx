export default function ParentsSection({
  title = "ឪពុកម្តាយ",
  names = [
    "លោក យាន សាវី",
    "លោក ម៉ៅ ឆាយ",
    "អ្នកស្រី ឈុន សេងហ៊ន់",
    "អ្នកស្រី សៀង ឡា",
  ],
  className = "animate-[fade-up_0.6s_ease-out]",
}) {
  const cleanNames = names.map((n) => n.trim().replace(/\s+/g, " "));

  const splitHonorific = (full) => {
    const HONORIFICS = ["អ្នកស្រី", "លោក"];
    for (const h of HONORIFICS) {
      if (full.startsWith(h + " ")) {
        return { honorific: h, person: full.slice(h.length).trim() };
      }
      if (full === h) return { honorific: h, person: "" };
    }
    return { honorific: "", person: full };
  };

  const items = cleanNames.map(splitHonorific);

  const rows = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push([items[i], items[i + 1] ?? { honorific: "", person: "" }]);
  }

  const NameCell = ({ item, align = "left" }) => {
    const honorific = item?.honorific ?? "";
    const person = item?.person ?? "";
    if (!honorific && !person) {
      return <span className={align === "right" ? "text-right" : ""} />;
    }

    const personNbsp = person.replace(/\s+/g, "\u00A0");

    return (
      <span className={`min-w-0 ${align === "right" ? "text-right" : ""}`}>
        <span className="inline-block whitespace-nowrap break-keep">
          {honorific && (
            <span className="moulpali-regular">
              {honorific}
              {person ? "\u00A0" : ""}
            </span>
          )}
          {person && <span className="moul-regular">{personNbsp}</span>}
        </span>
      </span>
    );
  };

  return (
    <section
      aria-labelledby="parents-heading"
      className={[
        "mx-auto w-full",
        "max-w-[20rem]",            // Increased width for default (base) screens
        "sm:max-w-[42rem]",         // Further increase for small screens
        "md:max-w-[50rem]",         // Tablets
        "lg:max-w-[54rem]",         // Laptops
        "xl:max-w-[60rem]",         // Desktops
        "2xl:max-w-[72rem]",        // Large desktops
        "min-[1920px]:max-w-[80rem]", // UHD screens
        "px-10",                    // Increased padding on default and XS
        "sm:px-8",                  // More refined padding for small screens
        "md:px-10",                 // Increased padding for tablets
        "lg:px-[14rem]",            // Wide padding for large screens
        "xl:px-[18rem]",            // Refined padding for XL
        "2xl:px-[16rem]",           // Padding adjustments for larger screens
        "min-[1920px]:px-20",       // Max padding for very large screens
        "py-6 sm:py-8 md:py-10 lg:py-12 xl:py-10 2xl:py-10 min-[1920px]:py-12", // Adjusted vertical padding
        className,
      ].join(" ")}
    >
      <h2 id="parents-heading" className="sr-only">
        {title}
      </h2>

      <div
        className={[
          "text-[var(--primary)] leading-[1.85]",

          "text-[0.65rem]",       // Slightly larger font for the base
          "sm:text-[0.875rem]",   // For small screens
          "md:text-[0.925rem]",   // Slight increase for medium screens
          "lg:text-[0.65rem]",       // Refined font size for large screens
          "xl:text-[0.65rem]",       // Keep it consistent at XL
          "2xl:text-[0.7rem]",    // Increase slightly for wide screens
          "3xl:text-[0.80rem]",
          "min-[1920px]:text-[1.15rem]", // Slightly larger on UHD

          "flex flex-col",
          "gap-y-3",              // Base gap
          "sm:gap-y-3.5",         // Increased gap for small screens
          "md:gap-y-4",           // Medium screens
          "lg:gap-y-5",           // Larger gap for large screens
          "xl:gap-y-4",           // Adjusted gap for XL
          "2xl:gap-y-3",          // Reduced gap for 2XL
          "min-[1920px]:gap-y-4", // Slightly increased gap for UHD
        ].join(" ")}
      >
        {rows.map(([left, right], i) => (
          <div
            key={i}
            className={[
              "grid grid-cols-2 items-center",
              "gap-x-10",            // Wider gap for base and small screens
              "sm:gap-x-12",         // More gap for small screens
              "md:gap-x-14",         // Medium screens
              "lg:gap-x-16",         // Larger gap for large screens
              "xl:gap-x-12",         // Adjusted gap for XL
              "2xl:gap-x-10",        // Reduced gap for 2XL
              "min-[1920px]:gap-x-12", // Max gap for UHD
            ].join(" ")}
          >
            <NameCell item={left} />
            <NameCell item={right} align="right" />
          </div>
        ))}
      </div>
    </section>
  );
}

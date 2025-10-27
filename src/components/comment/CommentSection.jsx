import React, { useId, useState, useRef } from "react";

/* ---------- Shared Styles (glassmorphism) ---------- */
const panel =
  "relative overflow-hidden rounded-md bg-white/10  " +
  "backdrop-blur-xl border border-white/30  shadow-xl shadow-black/10";

/* Inputs */
const inputBase =
  "w-full rounded-lg" +
  "text-sm leading-6 px-4 py-3 " +
  "bg-white/60 border border-white/50  " +
  "text-gray-900  placeholder:text-gray-500  " +
  "shadow-sm focus:outline-none focus:ring-4 focus:ring-white/40 " +
  "focus:border-white/70 ";

const sizes = {
  sm: "text-sm leading-6 px-3 py-2",
  md: "text-base leading-7 px-4 py-3",
  lg: "text-lg leading-8 px-5 py-4",
};

/* ---------- Reusable Inputs ---------- */
function Field({ id, label, className = "", size = "md", ...props }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block mb-2 text-xs font-medium text-[var(--secondary)] moulpali-regular text-left"
      >
        {label}
      </label>
      <input id={id} className={[inputBase, sizes[size], className].join(" ")} {...props} />
    </div>
  );
}

function Textarea({
  id,
  label,
  hint,
  hintId,
  maxLength = 500,
  value,
  onChange,
  className = "",
  size = "md",
  ...props
}) {
  const count = value?.length ?? 0;
  const warn = maxLength >= 50 && count >= maxLength - 20;
  return (
    <div>
      <label
        htmlFor={id}
        className="block mb-2 text-xs font-medium text-[var(--secondary)]  moulpali-regular text-left"
      >
        {label}
      </label>
      <textarea
        id={id}
        className={[inputBase, sizes[size], "resize-y", className].join(" ")}
        rows={6}
        maxLength={maxLength}
        value={value}
        onChange={onChange}
        aria-describedby={hintId}
        spellCheck="false"
        dir="auto"
        {...props}
      />
      <div
        id={hintId}
        className="mt-2 flex items-center justify-between text-[0.5rem] leading-5 tracking-wide text-pretty text-[var(--secondary)] moulpali-regular"
      >
        <span>{hint}</span>
        <span aria-live="polite" className={warn ? "font-semibold" : ""}>
          {count}/{maxLength}
        </span>
      </div>
    </div>
  );
}

/* ---------- Main Component ---------- */
export function CommentSection({
  onSubmit,
  pending = false,
  maxLength = 500,
  minLength = 3,
  title = "សារជូនពរ",
}) {
  const reactId = useId();
  const nameId = `cs-name-${reactId}`;
  const msgId = `cs-message-${reactId}`;
  const hintId = `cs-hint-${reactId}`;
  const hpId = `hp-${reactId}`; // honeypot

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const composingRef = useRef(false); // avoid submitting mid-IME composition

  const trimmedName = name.trim();
  const trimmedMsg = message.trim();
  const meetsMin = trimmedName.length >= minLength && trimmedMsg.length >= minLength;
  const isBusy = pending || submitting;
  const isDisabled = isBusy || !meetsMin;

  async function handleSubmit(e) {
    e.preventDefault();
    if (composingRef.current) return;
    if (!meetsMin) return;

    // honeypot check
    const data = new FormData(e.currentTarget);
    if (data.get(hpId)) return;

    const payload = { name: trimmedName, message: trimmedMsg };
    try {
      setError("");
      setSubmitting(true);
      await onSubmit?.(payload);
      setName("");
      setMessage("");
    } catch (err) {
      setError(err?.message || "ការបញ្ជូនបរាជ័យ។ សូមព្យាយាមម្តងទៀត។");
    } finally {
      setSubmitting(false);
    }
  }

  function onKeyDown(e) {
    // Ctrl/⌘ + Enter submits (handy on desktop)
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && !isDisabled) {
      e.preventDefault();
      e.currentTarget.requestSubmit?.();
    }
  }

  return (
    <section className="relative py-10 sm:py-16">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/5 to-transparent " />

      <div className="relative mx-auto max-w-screen-sm">
        <div className={panel}>
          <div className="pointer-events-none absolute inset-0  ring-1 ring-white/30 " />
          <div className="pointer-events-none absolute -inset-1 rounded-[28px] bg-gradient-to-tr from-white/30 via-white/0 to-white/20 blur-2xl opacity-30" />

          <div className="relative p-6 sm:p-8">
            <h2 className="text-center font-extrabold tracking-tight moul-regular text-base sm:text-lg leading-tight text-[var(--primary)]">
              {title}
            </h2>

            <p className="mt-3 text-center text-[0.65rem] sm:text-sm lg:text-xs xl:text-xs lg:leading-[3.5vh]  moulpali-regular text-pretty leading-relaxed tracking-wide text-[var(--text)]">
              សូមបញ្ចូលឈ្មោះ និង ផ្ញើសារជូនពរ ដើម្បីប្រសិទ្ធពរជ័យ ដល់គូស្វាមី ភរិយាថ្មី
            </p>

            <form
              className="mt-6 space-y-5"
              onSubmit={handleSubmit}
              onKeyDown={onKeyDown}
              noValidate
            >
              {/* Honeypot (hidden to humans) */}
              <div className="hidden">
                <label htmlFor={hpId}>Do not fill</label>
                <input id={hpId} name={hpId} tabIndex={-1} autoComplete="off" />
              </div>

              <Field
                id={nameId}
                label="ឈ្មោះ"
                type="text"
                name="name"
                placeholder="សូមបញ្ចូលឈ្មោះរបស់អ្នក"
                className="moulpali-regular text-xs text-pretty rounded-md"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                onCompositionStart={() => (composingRef.current = true)}
                onCompositionEnd={() => (composingRef.current = false)}
                size="md"
                aria-invalid={trimmedName.length < minLength ? "true" : "false"}
                autoComplete="name"
                inputMode="text"
              />

              <Textarea
                id={msgId}
                label="សារជូនពរ"
                name="message"
                placeholder="សូមបញ្ចូលសារជូនពរ. . . . . "
                className="moulpali-regular text-xs text-pretty rounded-md"
                hint="💡 ព័ត៌មានរបស់អ្នកអាចត្រូវបានបង្ហាញលើទំព័រខាងក្រោម (បើអ្នកយល់ព្រម)"
                hintId={hintId}
                maxLength={maxLength}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onCompositionStart={() => (composingRef.current = true)}
                onCompositionEnd={() => (composingRef.current = false)}
                size="md"
                aria-invalid={trimmedMsg.length < minLength ? "true" : "false"}
              />

              {error ? (
                <p className="text-sm text-red-600 siemreap-regular" aria-live="assertive">
                  {error}
                </p>
              ) : (
                <span className="sr-only" aria-live="polite">
                  {isBusy ? "កំពុងបញ្ជូន..." : "រួចរាល់"}
                </span>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isDisabled}
                  className={[
                    "inline-flex items-center justify-center rounded-lg px-5 py-3",
                    "text-xs font-medium text-white",
                    "bg-[var(--primary)]/85  hover:bg-[var(--secondary)] ",
                    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40",
                    "active:scale-[0.99] transition shadow-md shadow-black/20 backdrop-blur moulpali-regular",
                    isDisabled ? "opacity-60 cursor-not-allowed" : "",
                  ].join(" ")}
                >
                  {isBusy ? (
                    <>
                      <svg
                        className="mr-2 h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                        <path
                          d="M22 12a10 10 0 0 1-10 10"
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeLinecap="round"
                        />
                      </svg>
                      កំពុងបញ្ជូន...
                    </>
                  ) : (
                    "បញ្ជូនសារ"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="pointer-events-none absolute -z-10 inset-x-0 -top-10 flex justify-center opacity-50">
          <div className="h-40 w-40 rounded-full bg-white/20 blur-3xl " />
        </div>
      </div>
    </section>
  );
}

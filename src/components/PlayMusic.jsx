
export default function PlayMusic({
  allowAudio,
  setAllowAudio,
  muted,
  setMuted,
  onEnableAudio, // optional: unlock + start playing in one click
}) {
  const togglePlay = async () => {
    if (!allowAudio) {
      if (onEnableAudio) {
        await onEnableAudio(); // single click: unlock + play
      } else {
        setAllowAudio(true);
      }
      return;
    }
    setMuted((m) => !m);
  };

  const ariaLabel = !allowAudio
    ? "Enable background music"
    : muted
    ? "Unmute background music"
    : "Mute background music";

  // Screen reader announcement text
  const liveText = !allowAudio ? "Play Music" : muted ? "Muted" : "Unmuted";

  return (
    <button
      type="button"
      onClick={togglePlay}
      className="
        fixed bottom-4 right-4 z-30 inline-flex items-center justify-center
        h-11 w-11 rounded-xl px-0
        bg-black/20 hover:bg-black/30 backdrop-blur
        text-white shadow-sm
        focus:outline-none focus:ring-2 focus:ring-white/60
        transition-transform duration-150 ease-out active:scale-95
        motion-reduce:transition-none
      "
      aria-pressed={allowAudio && !muted}
      aria-label={ariaLabel}
      title={ariaLabel}
      data-state={!allowAudio ? "locked" : muted ? "muted" : "unmuted"}
    >
      {!allowAudio ? (
        <img
          src="/images/svg/play-music.svg"
          alt="open music"
          aria-hidden="true"
          className="h-5 w-5"
          decoding="async"
          loading="lazy"
          title="open music"
        />
      ) : (
        <img
          src={muted ? "/images/svg/sound-off.svg" : "/images/svg/sound-on.svg"}
          alt="sound on"
          aria-hidden="true"
          className="h-5 w-5"
          decoding="async"
          loading="lazy"
          title="sound on"
        />
      )}

      {/* SR-only live region so the state change is announced */}
      <span className="sr-only" aria-live="polite">
        {liveText}
      </span>
    </button>
  );
}

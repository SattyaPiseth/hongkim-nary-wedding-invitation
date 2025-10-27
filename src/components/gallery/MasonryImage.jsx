// MasonryImage.jsx
export default function MasonryImage({ data, index, onOpen, eager = false }) {
  const { src, width, height } = data;
  const alt = `Gallery image ${index + 1}`;

  return (
    <button
      type="button"
      onClick={() => onOpen?.(index)}
      className="mb-4 block w-full break-inside-avoid rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      aria-label={alt}
      style={{ aspectRatio: `${width} / ${height}` }}

    >
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="w-full rounded-lg shadow-sm hover:brightness-105"
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "low"}
        decoding="async"
        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 25vw"
        draggable={false}
      />
    </button>
  );
}

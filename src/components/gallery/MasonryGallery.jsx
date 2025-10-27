import MasonryImage from "./MasonryImage";

export function MasonryGallery({ images, onOpen }) {
  return (
    <section
      className="grid grid-cols-1 gap-x-4"
      style={{ contain: "layout style paint", containIntrinsicSize: "1px 1000px" }}
    >
      {images.map((img, i) => (
        <div
          key={img.src || i} // ✅ key moved here
          data-aos="fade-up"
          data-aos-anchor-placement="top-center"
        >
          <MasonryImage
            data={img}
            index={i}
            onOpen={onOpen}
            eager={i < 4} // only first 3 images are eager/high
          />
        </div>
      ))}
    </section>
  );
}

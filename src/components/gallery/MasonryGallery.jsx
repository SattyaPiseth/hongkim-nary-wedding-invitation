import MasonryImage from "./MasonryImage";
import { computeMasonryLayout } from "../../utils/galleryLayout.js";

const ROW_CLASS = {
  landscapeSolo: "grid grid-cols-1 gap-3 sm:gap-4",
  landscapePair: "grid grid-cols-2 gap-3 sm:gap-4",
  portraitTriple: "grid grid-cols-3 gap-2 sm:gap-4",
  portraitPair: "grid grid-cols-2 gap-3 sm:gap-4",
  portraitSolo: "grid grid-cols-1 gap-3 sm:gap-4",
};

const DEFAULT_ROW_CLASS = "grid grid-cols-1 gap-3 sm:gap-4";

export function MasonryGallery({ images, onOpen }) {
  const layout = computeMasonryLayout(images);

  if (!layout.rows.length) {
    return null;
  }

  let renderedCount = 0;

  return (
    <section
      className="space-y-6"
      style={{ contain: "layout style paint", containIntrinsicSize: "1px 1000px" }}
    >
      {layout.rows.map((row) => {
        const className = ROW_CLASS[row.type] ?? DEFAULT_ROW_CLASS;

        return (
          <div key={row.key} className={className}>
            {row.items.map(({ data, index }) => {
              const eager = renderedCount < 4;
              renderedCount += 1;

              return (
                <div
                  key={data?.src || index}
                  data-aos="fade-up"
                  data-aos-anchor-placement="center-center"
                >
                  <MasonryImage
                    data={data}
                    index={index}
                    onOpen={onOpen}
                    eager={eager}
                  />
                </div>
              );
            })}
          </div>
        );
      })}
    </section>
  );
}

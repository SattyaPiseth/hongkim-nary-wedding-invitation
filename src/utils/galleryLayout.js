const LANDSCAPE = "landscape";
const PORTRAIT = "portrait";

const ORIENTATION_ORDER = [LANDSCAPE, PORTRAIT];

const rowConfig = [
  { type: "landscapeSolo", orientation: LANDSCAPE, take: 1 },
  { type: "landscapePair", orientation: LANDSCAPE, take: 2, fallback: { type: "landscapeSolo" } },
  { type: "portraitTriple", orientation: PORTRAIT, take: 3, fallback: { type: "portraitPair" } },
  { type: "portraitPair", orientation: PORTRAIT, take: 2, fallback: { type: "portraitSolo" } },
];

const chunkPortraitFallback = [
  { size: 3, type: "portraitTriple" },
  { size: 2, type: "portraitPair" },
  { size: 1, type: "portraitSolo" },
];

const chunkLandscapeFallback = [
  { size: 2, type: "landscapePair" },
  { size: 1, type: "landscapeSolo" },
];

function orient(images) {
  if (!Array.isArray(images)) {
    return [];
  }

  return images.map((img, index) => {
    if (img == null) {
      return { data: img, index, orientation: LANDSCAPE };
    }

    if (typeof img === "string") {
      return { data: img, index, orientation: LANDSCAPE };
    }

    const { width = 0, height = 0 } = img;
    const orientation = width >= height ? LANDSCAPE : PORTRAIT;
    return { data: img, index, orientation };
  });
}

function groupByOrientation(oriented) {
  const buckets = {
    [LANDSCAPE]: [],
    [PORTRAIT]: [],
  };

  oriented.forEach((item) => {
    buckets[item.orientation].push(item);
  });

  return buckets;
}

function pushRow(rows, order, type, items) {
  if (!items || !items.length) {
    return false;
  }

  rows.push({
    key: `row-${rows.length}-${type}`,
    type,
    items,
  });
  for (const item of items) {
    order.push(item.index);
  }
  return true;
}

function take(queue, count) {
  if (!queue.length || count <= 0) {
    return [];
  }
  return queue.splice(0, count);
}

export function computeMasonryLayout(images) {
  const oriented = orient(images);
  if (!oriented.length) {
    return { rows: [], order: [] };
  }

  const buckets = groupByOrientation(oriented);
  const rows = [];
  const order = [];

  let safety = oriented.length * 2;

  while (safety-- > 0 && ORIENTATION_ORDER.some((key) => buckets[key].length)) {
    let produced = false;

    for (const config of rowConfig) {
      const source = buckets[config.orientation];
      if (!source.length) {
        continue;
      }

      if (source.length >= config.take) {
        const items = take(source, config.take);
        produced = pushRow(rows, order, config.type, items) || produced;
        continue;
      }

      if (config.fallback) {
        const items = take(source, source.length);
        produced = pushRow(rows, order, config.fallback.type, items) || produced;
      }
    }

    if (!produced) {
      break;
    }
  }

  const flushRemaining = (queue, chunks) => {
    while (queue.length) {
      const available = queue.length;
      let handled = false;

      for (const chunk of chunks) {
        if (available >= chunk.size) {
          const items = take(queue, chunk.size);
          pushRow(rows, order, chunk.type, items);
          handled = true;
          break;
        }
      }

      if (!handled) {
        const items = take(queue, queue.length);
        pushRow(rows, order, chunks[chunks.length - 1].type, items);
      }
    }
  };

  flushRemaining(buckets[LANDSCAPE], chunkLandscapeFallback);
  flushRemaining(buckets[PORTRAIT], chunkPortraitFallback);

  return { rows, order };
}

export function computeMasonryOrder(images) {
  return computeMasonryLayout(images).order;
}

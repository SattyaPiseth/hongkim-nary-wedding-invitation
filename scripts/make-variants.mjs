import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const src = "public/images/cover-page/name-cover-01.avif"; // original
const outDir = "public/images/cover-page";
const widths = [320, 480, 640, 768, 1024, 1280, 1536, 2016]; // match your srcSet

mkdirSync(outDir, { recursive: true });

for (const w of widths) {
  const out = join(outDir, `name-cover-01-${w}.avif`);
  await sharp(src)
    .resize({ width: w, withoutEnlargement: true })
    .avif({ quality: 55, effort: 4 }) // tune: lower quality for smaller, higher for larger if you want
    .toFile(out);
  console.log("wrote", out);
}
console.log("done.");

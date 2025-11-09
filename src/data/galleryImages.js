import { withAssetVersion } from "../utils/assetVersion.js";

const BASE_GALLERY_IMAGES = [
  // Portrait images (1200x1600)
  { src: "/images/home-page/gallary/portrait-01.jpg", width: 1200, height: 1600 },
  { src: "/images/home-page/gallary/portrait-06.jpg", width: 1200, height: 1600 },
  { src: "/images/home-page/gallary/portrait-03.jpg", width: 1200, height: 1600 },
  { src: "/images/home-page/gallary/portrait-02.jpg", width: 1200, height: 1600 },
  { src: "/images/home-page/gallary/portrait-04.jpg", width: 1200, height: 1600 },

  // { src: "/images/home-page/gallary/portrait-05.jpg", width: 1200, height: 1600 },
  { src: "/images/home-page/gallary/portrait-07.jpg", width: 1200, height: 1600 },
  { src: "/images/home-page/gallary/portrait-08.jpg", width: 1200, height: 1600 },
  { src: "/images/home-page/gallary/portrait-09.jpg", width: 1200, height: 1600 },
  { src: "/images/home-page/gallary/portrait-10.jpg", width: 1200, height: 1600 },
  { src: "/images/home-page/gallary/portrait-13.jpg", width: 1200, height: 1600 },
  { src: "/images/home-page/gallary/portrait-11.jpg", width: 1200, height: 1600 },
  { src: "/images/home-page/gallary/portrait-12.jpg", width: 1200, height: 1600 },


  // Landscape images (1800x1200)
  { src: "/images/home-page/gallary/landscape-04.jpg", width: 1800, height: 1200 },
  { src: "/images/home-page/gallary/landscape-11.jpg", width: 1800, height: 1200 },
  { src: "/images/home-page/gallary/landscape-02.jpg", width: 1800, height: 1200 },
  { src: "/images/home-page/gallary/landscape-01.jpg", width: 1800, height: 1200 },
  { src: "/images/home-page/gallary/landscape-03.jpg", width: 1800, height: 1200 },
  { src: "/images/home-page/gallary/landscape-05.jpg", width: 1800, height: 1200 },
  { src: "/images/home-page/gallary/landscape-06.jpg", width: 1800, height: 1200 },
  { src: "/images/home-page/gallary/landscape-08.jpg", width: 1800, height: 1200 },
  { src: "/images/home-page/gallary/landscape-07.jpg", width: 1800, height: 1200 },
  // { src: "/images/home-page/gallary/landscape-09.jpg", width: 1800, height: 1200 },
  { src: "/images/home-page/gallary/landscape-10.jpg", width: 1800, height: 1200 },
];

export const GALLERY_IMAGES = BASE_GALLERY_IMAGES.map((image) => ({
  ...image,
  src: withAssetVersion(image.src),
}));

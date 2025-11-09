import { useEffect } from "react";
import { useLoaderData, useOutletContext } from "react-router-dom";
import Seo19 from "../components/Seo19.jsx";
import CoverSection from "../components/base/CoverSection.jsx";
import Spinner from "../components/button/Spinner.jsx";
import DecorativeFooter from "../components/base/DecorativeFooter.jsx";

const HERO_HEADING_CLASSNAMES = `
  m-auto max-w-[250px] w-full h-auto translate-y-12 min-[480px]:translate-y-0
  min-[320px]:mt-[5vh] min-[320px]:max-w-[250px]
  min-[360px]:mt-[10vh]
  min-[375px]:mt-[10vh] min-[375px]:max-w-[250px]
  min-[384px]:mt-[11vh]
  min-[390px]:mt-[10vh] min-[390px]:max-w-[260px]
  min-[412px]:mt-[11vh] min-[412px]:max-w-[280px]
  min-[414px]:mt-[10vh] min-[414px]:max-w-[280px]
  min-[425px]:-mt-[8vh]
  min-[428px]:mt-[10vh]
  min-[480px]:mt-[15vh]
  min-[768px]:max-w-[370px]
  min-[768px]:mt-[8vh]
  min-[800px]:mt-[15vh] min-[800px]:max-w-[350px]
  min-[810px]:mt-[8vh]
  min-[820px]:mt-[10vh]  min-[820px]:max-w-[380px]
  min-[1024px]:max-w-[220px]
  min-[1280px]:mt-[15vh] min-[1280px]:max-w-[350px]
  min-[1366px]:mt-[15vh] min-[1366px]:max-w-[260px]
  min-[1440px]:max-w-[260px]
  min-[1536px]:max-w-[450px] min-[1536px]:mt-[16vh]
  min-[1920px]:max-w-[350px]
  min-[2560px]:max-w-[450px]
  [@media(min-width:1360px)_and_(max-height:768px)]:max-w-[20%]
  [@media(min-width:1280px)_and_(max-height:720px)]:!max-w-[20%]
  [@media(min-width:1280px)_and_(max-height:800px)]:max-w-[20%]
  [@media(min-width:1280px)_and_(max-height:850px)]:max-w-[22.5%]
  [@media(min-width:1440px)_and_(max-height:900px)]:max-w-[22.5%]
  [@media(min-width:1536px)_and_(max-height:864px)]:max-w-[20%]
`;

const HERO_MONOGRAM_CLASSNAMES = `
  m-auto max-w-[50%] w-full mt-[4vh] mb-[3vh]
  min-[480px]:mt-[0vh]
  min-[480px]:mb-[1.5vh]
  min-[768px]:max-w-[40%]
  min-[1280px]:max-w-[20%]
  min-[1366px]:max-w-[15%]
  min-[1440px]:max-w-[17.5%]
  min-[1536px]:mt-[2.5vh]
  min-[1920px]:max-w-[15%]
  [@media(min-width:1280px)_and_(max-height:720px)]:max-w-[15%]
  [@media(min-width:1280px)_and_(max-height:800px)]:max-w-[17.5%]
  [@media(min-width:1366px)_and_(max-height:768px)]:max-w-[15%]
`;

const ROBOTS_DIRECTIVE = "noindex, nofollow, noarchive";

export default function CoverPage() {
  const outlet = useOutletContext() ?? {};
  const mode = outlet.mode ?? "background";
  const startStory = outlet.startStory ?? (() => {});
  const isStoryPlaying = mode === "story";
  const bgPainted = outlet.bgPainted ?? false;
  const data = useLoaderData() ?? {};
  const { indexable = true, seo = {}, customer = null } = data;

  const showCoverArt = !isStoryPlaying;
  const coverFooterSizing = outlet.coverFooterSizing;
  useBodyScrollLock(!bgPainted);

  const seoProps = {
    ...seo,
    noindex: !indexable,
    noarchive: !indexable,
    googleBot: !indexable ? ROBOTS_DIRECTIVE : undefined,
    bingBot: !indexable ? ROBOTS_DIRECTIVE : undefined,
  };

  if (!bgPainted) {
    return <LoadingOverlay seoProps={seoProps} />;
  }

  return (
    <>
      <Seo19 {...seoProps} />

      {showCoverArt && <HeroArt />}

      <main className="relative z-10">
        <CoverSection
          isStoryPlaying={isStoryPlaying}
          onStart={startStory}
          customer={customer}
        />
      </main>

      {showCoverArt && (
        <DecorativeFooter active size={coverFooterSizing} />
      )}
    </>
  );
}

function useBodyScrollLock(shouldLock) {
  useEffect(() => {
    if (!shouldLock) return;

    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, [shouldLock]);
}

function LoadingOverlay({ seoProps }) {
  return (
    <>
      <Seo19 {...seoProps} />
      <div
        className="
          fixed inset-0 z-[60] grid place-items-center
          bg-black/5 supports-backdrop-blur:bg-black/5 backdrop-blur-[2px]
        "
      >
        <div role="status" aria-live="polite" aria-busy="true">
          <Spinner label="Preparing background..." size="lg" />
          <p className="sr-only">Loading background media for the cover page.</p>
        </div>
      </div>
    </>
  );
}

function HeroArt() {
  return (
    <header className="relative z-10 -mt-[1.5rem]">
      <img
        className={HERO_HEADING_CLASSNAMES}
        src="/images/cover-page/heading-cover-page.png?v=20251230v1"
        alt="heading"
      />
      <img
        width={681}
        height={383}
        className={HERO_MONOGRAM_CLASSNAMES}
        src="/images/cover-page/monogram.png"
        alt="hero section"
      />
    </header>
  );
}

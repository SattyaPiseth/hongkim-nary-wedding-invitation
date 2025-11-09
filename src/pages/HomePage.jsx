import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import Seo19 from "../components/Seo19";
import DescriptionSection from "../components/DescriptionSection";
import ParentsSection from "../components/ParentsSection";
import Heading from "../components/base/Heading";
import DecorativeFooter from "../components/base/DecorativeFooter.jsx";
import { withAssetVersion } from "../utils/assetVersion.js";

export default function HomePage() {
  const outlet = useOutletContext() ?? {};
  const homeFooterSizing = outlet.coverFooterSizing;
  const raw = import.meta.env.VITE_SITE_URL || "http://localhost:5173";
  const siteUrl = raw.replace(/\/+$/, "");
  const canonical = `${siteUrl}/`;
  const updatedTime = import.meta.env.VITE_BUILD_TIME || undefined;

  const jsonLd = useMemo(() => {
    const base = {
      "@context": "https://schema.org",
      name: "Hongkim & Nary Wedding",
      url: canonical,
    };
    return [
      { ...base, "@type": "WebSite" },
      {
        ...base,
        "@type": "Organization",
        logo: withAssetVersion(`${siteUrl}/images/landscape-04.jpg`),
      },
    ];
  }, [canonical, siteUrl]);

  return (
    <>
      <Seo19
        title="Home"
        description="Welcome to the celebration — schedule, gallery, and RSVP."
        canonical={canonical}
        ogType="website"
        updatedTime={updatedTime}
        jsonLd={jsonLd}
      />

      
      <Heading/>

      <div
        className={`
          relative z-10 mx-auto flex flex-col items-center
          w-full max-w-[clamp(22rem,92vw,56rem)]
          min-h-dvh overflow-hidden

          /* Top pad: safe-area + fluid hero spacing */
          pt-[calc(env(safe-area-inset-top,0px)+clamp(0.5svh,3.5dvh,5lvh))] 
          xs:pt-[calc(env(safe-area-inset-top,0px)+clamp(0.25svh,2dvh,3.5lvh))]  
          sm:pt-[calc(env(safe-area-inset-top,0px)+clamp(0.15svh,1.5dvh,2.5lvh))]  
          md:pt-[calc(env(safe-area-inset-top,0px)+clamp(0.1svh,1.25dvh,2lvh))]
          lg:pt-[calc(env(safe-area-inset-top,0px)+clamp(0.08svh,1dvh,1.75lvh))]
          xl:pt-[calc(env(safe-area-inset-top,0px)+clamp(0.05svh,0.85dvh,1.5lvh))]
          2xl:pt-[calc(env(safe-area-inset-top,0px)+clamp(0.03svh,0.65dvh,1.25lvh))] 
          3xl:pt-[calc(env(safe-area-inset-top,0px)+clamp(0.025svh,0.5dvh,1.25lvh))]


          /* Fluid horizontal padding (default + xs refined) */
          px-[clamp(0.75rem,3.5vw,1.5rem)]
          xs:px-[clamp(0.9rem,3.75vw,1.75rem)]
          sm:px-[clamp(1.1rem,4vw,2rem)]
          md:px-[clamp(1.25rem,4.5vw,2.5rem)]
          lg:px-[clamp(1.5rem,5vw,3rem)]

          /* Vertical rhythm between sections */
          gap-y-[clamp(1rem,3.25vw,1.5rem)]
          xs:gap-y-[clamp(1.1rem,3.5vw,1.75rem)]
          sm:gap-y-[clamp(1.25rem,3.5vw,2rem)]
          md:gap-y-[clamp(1rem,3vw,1.75rem)]
          lg:gap-y-[clamp(0.75rem,2vw,1.5rem)]
        `}
        style={{
          // small, self-contained tokens for this page
          // reuse them if you like in other pages too
          "--hero-lift": "clamp(0.75rem, 4vw, 2rem)",
          "--hero-lift-xs": "clamp(0.5rem, 3.25vw, 1.5rem)",
        }}
      >
        {/* <Heading /> */}

        {/* Smooth overlap: smaller on phones, subtle on larger screens */}
        <div
          className={`
            w-full
            -mt-[clamp(2.5rem,7vw,5rem)]  
            xs:-mt-[var(--hero-lift-xs)]
            sm:-mt-[clamp(0.5rem,3vw,1.25rem)]
            md:-mt-[clamp(0.5rem,2.5vw,1.25rem)]
            lg:-mt-[clamp(0.75rem,2vw,1.25rem)] 
            xl:-mt-[clamp(1rem,2.25vw,1.5rem)]
            2xl:-mt-[clamp(1.25rem,2.5vw,2rem)]
            3xl:-mt-[clamp(1.5rem,3vw,2.25rem)]
          `}
        >
          <ParentsSection />
        </div>

        <DescriptionSection />

        {/* <div
          className="
            w-full h-screen
            bg-red-300
            xs:bg-black
            sm:bg-orange-300
            md:bg-yellow-300
            lg:bg-green-300
            xl:bg-blue-300
            2xl:bg-purple-300
            3xl:bg-gray-300
          "
        >
          <p className="text-center text-xl font-semibold pt-10 text-white">
            Resize the window to see the background change
          </p>
        </div> */}
      </div>

      <DecorativeFooter active size={homeFooterSizing} />
    </>
  );
}

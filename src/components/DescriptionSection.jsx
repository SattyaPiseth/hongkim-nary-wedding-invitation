import { useMemo, useState } from "react";
import SoftCard from "./SoftCard";
import Countdown from "./Countdown";
import { MasonryGallery } from "./gallery/MasonryGallery";
import { Lightbox } from "./modal/Lightbox";

import { GALLERY_IMAGES } from "../data/galleryImages";
import morning_event_image from "/images/home-page/agenda/agenda-01.png";
import afternoon_event_image from "/images/home-page/agenda/agenda-02.png";
import { GratitudeSection } from "./GratitudeSection";
import PromoteSection from "./PromoteSection";
import Discussion from "./comment/Discussion";
import AnimatedActionButton from "./button/AnimatedActionButton";
import Spinner from "./button/Spinner";
import { computeMasonryOrder } from "../utils/galleryLayout.js";

export default function DescriptionSection({
  // Customizable props with safe defaults
  eventDateIso = import.meta.env.VITE_EVENT_DATE || "2025-11-30T17:00:00+07:00", // Cambodia +07:00
  venueName = "ភោជនីយដ្ឋាន ឡាក់គី ប្រាយ ផ្លូវ៥៩៨ រាជធានីភ្នំពេញ ដោយមេត្រីភាព។ សូមអរគុណ!",
  startTimeText = "និងពិសាភោជនីយអាហារដែលនឹង <br/> ប្រព្រឹត្តទៅនៅ",
  khmerDateText = "ថ្ងៃ អាទិត្យ ១០ កើត ខែមិគសិរ ឆ្នាំម្សាញ់ សប្តស័ក ព.ស ២៥៦៩ ",
  khmerBoranDateText = "ត្រូវនឹងថ្ងៃទី ៣០ ខែវិច្ឆិកា ឆ្នាំ២០២៥ វេលាម៉ោង ៥:០០ ល្ងាច ស្ថិតនៅ",
  mapHref = "https://maps.app.goo.gl/mJzzo7rHZ7SUfs4t6",
  galleryImages = GALLERY_IMAGES,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const displayOrder = useMemo(
    () => computeMasonryOrder(galleryImages),
    [galleryImages],
  );
  const totalImages = Array.isArray(galleryImages) ? galleryImages.length : 0;

  const resolveByOffset = (currentIndex, offset) => {
    if (totalImages <= 0) return currentIndex;
    if (displayOrder.length > 0) {
      const pos = displayOrder.indexOf(currentIndex);
      if (pos !== -1) {
        const nextPos =
          (pos + offset + displayOrder.length) % displayOrder.length;
        return displayOrder[nextPos];
      }
    }
    return (currentIndex + offset + totalImages) % totalImages;
  };

  const open = (i) => { setIdx(i); setIsOpen(true); };
  const close = () => setIsOpen(false);
  const prev = () => setIdx((i) => resolveByOffset(i, -1));
  const next = () => setIdx((i) => resolveByOffset(i, 1));
  const select = (target) => {
    if (typeof target === "number" && target >= 0 && target < totalImages) {
      setIdx(target);
    }
  };

  // Constants (no need for useMemo)
  const countdownLabel = "Wedding Countdown";
  const mapTitle = "Lucky Bright Restaurant Map";

  return (
    <section
      lang="km"
      aria-labelledby="invite-title"
      className="w-full mx-auto max-w-[min(92vw,56rem)] 
             py-1.5 
             xs:py-4 sm:py-8 
             md:px-[clamp(1.5rem,6vw,10rem)] 
             lg:px-[clamp(2rem,8vw,12rem)] lg:m-auto
             xl:px-[clamp(2rem,10vw,18rem)] xl:-mt-[7vh]
             2xl:px-[clamp(5rem,10vw,11rem)] 2xl:-mt-[9vh] 
             3xl:px-[clamp(5rem,6vw,14rem)] 3xl:-mt-[6vh]"
      data-aos="fade-up"
    >
      <SoftCard>
        {/* Invite Heading */}
        <h2
          id="invite-title"
          className="font-khangtapenh text-(--primary) text-lg tracking-wide text-center text-balance"
        >
          មានកិត្តិយសសូមគោរពអញ្ជើញ
        </h2>

        {/* Intro copy */}
        <p className="bokor-regular text-sm tracking-wide leading-6 sm:leading-6 md:leading-7 max-w-[65ch] mx-auto text-[var(--text)]/90 text-pretty">
          សម្ដេច ទ្រង់ ឯកឧត្ដម លោកឧកញ៉ា លោកជំទាវ <br/> លោក​ លោកស្រី អ្នកនាង កញ្ញា និង
          ប្រិយមិត្ត អញ្ជើញចូលរួម<br/>ជាអធិបតី និង​ ជាភ្ញៀវកិត្តិយស
          ដើម្បីប្រសិទ្ធពរជ័យ សិរិសួស្ដី ជ័យមង្គល ក្នុងពិធីរៀបអាពាហ៍ពិពាហ៍
         <br/> កូនប្រុស-ស្រី របស់យើងខ្ញុំ។
        </p>
        {/* <p className="bokor-regular text-sm tracking-wide leading-[3.5vh] text-[var(--text)]/90 text-pretty -mt-[2.5vh]">
        កូនប្រុស កូនស្រី របស់យើងខ្ញុំ។</p> */}

        {/* Couple names */}
        <section aria-labelledby="couple-title" className="mt-3">
          <h3 id="couple-title" className="sr-only">
            ឈ្មោះកូនប្រុស និងកូនស្រី
          </h3>
          <dl className="mx-auto max-w-3xl grid grid-cols-2 gap-4 sm:gap-6">
            <div className="flex flex-col items-center gap-3">
              <dt className="font-khangtapenh tracking-wide text-lg text-(--secondary)">
                កូនប្រុសនាម
              </dt>
              <dd className="moul-regular text-base sm:text-lg md:text-base lg:text-base xl:text-base text-[var(--primary)]">
                ស៊ឹម ហុងគីម
              </dd>
            </div>
            <div className="flex flex-col items-center gap-3">
              <dt className="font-khangtapenh tracking-wide text-lg text-[var(--secondary)]">
                កូនស្រីនាម
              </dt>
              <dd className="moul-regular text-base sm:text-lg md:text-base lg:text-base xl:text-base text-[var(--primary)]">
                តាំង ណារី
              </dd>
            </div>
          </dl>
        </section>

        {/* Event meta */}
        <section className="mt-4">
          <div className="mx-auto max-w-lg px-3 sm:px-0 flex flex-col
                          gap-3 sm:gap-4 md:gap-5">
            {/* intro line */}
            <p className="bokor-regular text-pretty text-center
                          text-sm leading-7 tracking-widest
      
                          text-(--text)/90">
              {/* {startTimeText} */}
            <span dangerouslySetInnerHTML={{__html: startTimeText}}/>
            </p>

            {/* date (slightly larger, wrapped in <time>) */}
            <p
              className="font-khangtapenh text-pretty text-center
                        text-base leading-7
                        text-(--secondary)"
            >
              <time dateTime={eventDateIso}>{khmerDateText}</time>
              <span dangerouslySetInnerHTML={{ __html: khmerBoranDateText }} />
            </p>


            {/* venue */}
            <p className="bokor-regular text-pretty  text-center
                          text-sm leading-7 
                          text-(--text)">
              {venueName}
            </p>

            {/* Divider (slightly wider than before but still modest) */}
            <div className="flex justify-center mt-[1vh]">
              <img
                className="w-[clamp(10rem,40vw,15rem)] max-w-3xl"
                src="/images/border-styles/divider.avif"
                alt="Divider Image"
                loading="lazy"
                decoding="async"
                title="Divider Image"
              />
            </div>

            {/* Bigger English gratitude image */}
            <div className="mx-auto my-[2vh] max-w-3xl flex justify-center" data-aos="fade-up">
              <img
                src="/images/home-page/gratitude/gratitude-english.png"
                alt="Gratitude in English"
                className="w-[clamp(20rem,90vw,50rem)] h-auto object-contain"
                loading="lazy"
                decoding="async"
                sizes="(max-width: 768px) 90vw, 800px"
                title="Gratitude in English"
              />
            </div>

            {/* Countdown */}
            <section className="mt-6 flex flex-col items-center justify-center gap-3 text-3xl text-(--primary) " data-aos="fade-up" data-aos-anchor-placement="bottom-bottom">
              <h3 className="font-playfair tracking-wide">Save The Date</h3>
              <p className="font-merriweather text-xl tracking-wider">Hongkim & Nary Wedding</p>
              <Countdown target={eventDateIso} ariaLabel={countdownLabel} />
            </section>

            
              {/* Full-bleed image inside SoftCard */}
              <div className="-mx-2 sm:-mx-7 md:-mx-8 my-[5vh] overflow-hidden rounded-lg" data-aos="zoom-in"
     data-aos-anchor-placement="top-center">
                <div className="relative w-full aspect-3/4">
                  <img
                    src="/images/home-page/gallary/portrait-01.jpg"
                    alt="image"
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    width="1200"
                    height="1600"
                  />
                </div>
              </div>

            {/* map button — bigger tap target on mobile */}
            {/* <a
              href={mapHref}
              target="_blank"
              rel="noopener noreferrer"
              title="បើកទីតាំងក្នុងផែនទី"
              className="mt-1 inline-flex items-center justify-center gap-2
                        rounded-md px-4 py-2 sm:px-3 sm:py-2
                        text-[var(--primary)] ring-1 ring-[var(--primary)]/20
                        hover:bg-[var(--primary)]/5 transition-colors
                        moul-regular tracking-wide"
              aria-label="បើកទីតាំងក្នុងផែនទី"
            >
              <img
                className="w-6 h-auto sm:w-7"
                src={google_map_icon}
                loading="lazy"
                decoding="async"
                alt=""
                aria-hidden="true"
              />
              <span className="text-sm underline-offset-4 hover:underline">
                បើកមើលទីតាំង
              </span>
            </a> */}
            <AnimatedActionButton
              variant="bare"        
              src="/images/home-page/map/location-button-01.png"
              ariaLabel="បើកផែនទី"
              imgClassName="relative block mx-auto w-[70%] object-contain"
              withShine={true}
              withRipple={true}
              className="bg-transparent shadow-none"
              onStart={() =>
                window.open(mapHref, "_self")
              }
            />

            {/* map embed */}
            <img src="/images/home-page/map/map.png" alt="Map of the Location" className="rounded-md shadow-sm mx-auto" data-aos="fade-up" loading="lazy" title="Map of the Location"/>
            {/* <div
              className="w-full aspect-video rounded-md overflow-hidden shadow-sm
                        mt-2 sm:mt-3"
              data-aos="flip-up"
            >
              <iframe
                title={mapTitle}
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3909.2936016057643!2d104.92715497588935!3d11.530783744824973!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x310950cfdcd0c189%3A0x5709443aac310b36!2sTonl%C3%A9%20Bassac%20II%20Restaurant!5e0!3m2!1sen!2ssg!4v1759817558847!5m2!1sen!2ssg"
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div> */}
          </div>
        </section>


        {/* Event posters */}
        <figure className="my-[10vh] flex justify-center py-20" data-aos="zoom-in">
          <div className="relative w-full">
            {/* Spinner while loading */}
            {!loaded && (
              <div className="absolute inset-0 grid place-items-center">
                <Spinner label="Loading image..." size="lg" />
              </div>
            )}

            {/* Poster image */}
            <img
              src={morning_event_image}
              alt="Morning event"
              onLoad={() => setLoaded(true)}
              onError={() => setLoadError(true)}
              className={`block w-full h-auto origin-center transition-all duration-700 ease-out
                ${loaded ? "opacity-100 scale-[1.3]" : "opacity-0 scale-[1.15]"}`}
              loading="lazy"
              decoding="async"
            />
          </div>
        </figure>



        <figure className="-mt-[5rem]">
          <img src={afternoon_event_image} alt="Afternoon event" loading="lazy" decoding="async" />
        </figure> 


        {/* Gallery */}
        <h3 className="font-khangtapenh text-xl mt-6 text-(--primary)" data-aos="fade-up">កម្រងរូបភាព</h3>
        <MasonryGallery images={galleryImages} onOpen={open} />

        {isOpen && (
          <Lightbox
            images={galleryImages}
            index={idx}
            onClose={close}
            onSelect={select}
            onPrev={prev}
            onNext={next}
            displayOrder={displayOrder}
          />
        )}

        <GratitudeSection />
        <Discussion />
        <PromoteSection
          src="/images/memora-shine/memora-shine-end-page.png"
          eager={true}                
          alt="Clean image"
          shadow=""                    
          imgShadow=""                 
          showGlow={false}            
        />

      </SoftCard>
    </section>
  );
}

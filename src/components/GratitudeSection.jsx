import React from 'react'
import { withAssetVersion } from "../utils/assetVersion.js";

export const GratitudeSection = () => {
  return (
    <>
      <section
        aria-labelledby="gratitude-title"
        className="my-[5vh] mx-auto max-w-screen-md xl:mx-[1.5vh]"
      >
        <h3
          id="gratitude-title"
          className="font-khangtapenh text-(--primary) text-lg tracking-wide text-center text-balance"
        >
          សេចក្ដីថ្លែងអំណរគុណ និងសូមអភ័យទោស
        </h3>

        <p className="bokor-regular mt-4 text-sm tracking-wide leading-[3.5vh] text-[var(--text)]/90 text-pretty">
          សូមថ្លែងអំណរគុណ យ៉ាងជ្រាលជ្រៅចំពោះការអញ្ជើញចូលរួមជាភ្ញៀវកិត្តិយសក្នុង ពិធីអាពាហ៍ពិពាហ៍ កូនប្រុស-កូនស្រី របស់យើងខ្ញុំ សូមមានសេចក្តីសុខ​ សុភមង្គលគ្រប់ពេលវេលាកុំបីឃ្លៀងឃ្លាតឡើយ។<br />សូមអរគុណ!
        </p>
        <p className="bokor-regular mt-4 text-sm tracking-wide leading-[3.5vh] text-[var(--text)]/90 text-pretty">
          យើងខ្ញុំជាមាតាបិតា កូនប្រុស កូនស្រី សូមអភ័យទោសដោយពុំបានជួបអញ្ជើញដោយផ្ទាល់។ វត្តមានរបស់ ឯកឧត្តម លោកឧកញ៉ា លោកជំទាវ លោកស្រី អ្នកនាងកញ្ញា និងប្រិយមិត្តទាំងអស់គឺជា កិត្តិយសដ៏ឧត្តុង្គឧត្តមសម្រាប់គ្រួសារយើងខ្ញុំ។ <br />សូមអរគុណ!
        </p>
      </section>
      {/* Divider (slightly wider than before but still modest) */}
      <div className="flex justify-center" >
        <img
          className="w-[clamp(10rem,40vw,15rem)] max-w-screen-md"
          src={withAssetVersion("/images/border-styles/divider.avif")}
          alt="Divider"
          loading="lazy"
          decoding="async"
          title='Divider'
        />
      </div>
      <section
        aria-labelledby="gratitude-title"
        className="my-[5vh] mx-auto max-w-screen-md"
       
      >
        <h3
          id="gratitude-title"
          className="font-playfair font-bold text-[var(--primary)] text-sm sm:text-lg tracking-wide text-center text-balance uppercase"
        >
          Our Gratitude And Apology
        </h3>

        <p className="font-merriweather mt-4 text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg tracking-wide leading-[3.5vh] text-[var(--text)]/90 text-pretty">
          We are extremely thankful for H.E., L.C., T., 
          Neak Oknha, Oknha, ladies and gentlemen for 
          your presence at the upcoming marriage of our children.
          We would like to apologize if this invitation 
          has not been personally delivered by us.
        </p>
      </section>
    </>
  )
}

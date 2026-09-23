import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import defaultCouplePhotoPath from '../assets/images/varsha_couple_letter_bg_1790150994699.jpg';
import { sounds } from '../utils/audio';

interface SorryPageProps {
  onNext: () => void;
  onBackToHeart: () => void;
  audioMuted: boolean;
  toggleAudio: () => void;
  isBgmPlaying?: boolean;
  bgmBlocked?: boolean;
  playBgm?: () => void;
  onUploadBgm?: (file: File) => void;
}

const MESSAGE_PARAGRAPHS = [
  "Nama 8th la irimthu frnds 8 years ah nama avolo close 4 years ah love.. frnd ah irukum bothe nama friendship namaku life long Venum nu rendu perume nenachom.. recent times la kovathula situation la na neraiya thappu panirka toxic ah behave panirka... na athulam illanu entha place laiyum sola matan antha time antha situation la panita.. en character athulam ila papa.. apo antha time la kovathula panathu dhan Elam.. Elam nane realise pani purinju life mara pothu nu nenaikira time la ne ipdi pandra🥹💖",
  "ellame yosi papa school time la yepdi irunthom yepdi pesa start panom na yepdi one side ah love pana unaku yepdi en mela feelings vanthuchu yepdi commit aanom 4 years yepdi irunthom ellame yosi papa.... kandipa inime ne enaku tara love pothum10000% mulu manasoda solran enaku ne pothum 🥹🥹 ",
  "Ne na pesnatha yosika venam enga Amma pesnatha yosika venam un frnds sonatha yosika venam.. yaar sonathum yosikatha 8 years ah nama ona irukom 🥹🤌🏻 4 years ah love pandrom 4 years la nama rendu per matum dna Elam pesnom decide panom namakula dna ellame irunthuchu neeye yosi yaar soleathum kekama yaar sonathum mind la eduthukama neeye yosi papa 🥹🥹.. na intha incident nadanthathu nala solala un Mela promise ah solran Inime enala unaku nimathi Santhosham entha place laiyum povathu papa.. un Mela promise pandra nambu ena",
  "Atha meeri unaku nimathi Santhosham illana. ne Sona nu thiurpi vantha apovum enaku ilanu soltu poiko Naanum apram una disturb pana matan.. ne enkuda vela vara venam enakaha yosika venam enakaha efforts pod venam life Nala pona ellame thana nadakum 🥹🥹 promise ah na idha vali nu nama life idhan nu nenachu ipdi pesala..na accept panikira yaarume perfect ila yaarachu oruthanga accept pana dha life Nala pogum nala irukum 1000000% mulu manasoda na unaku vara love ah matum accept panikira.. Inime entha place laiyum na yen varala yen panala nu keka matan nambu papa 🥹🥹",
  "Una thavira enaku vera ethume mukiyam Ila papa 🥹🥹 Inime 1 year vela polana kuda na santhoshama nimathiya irupa enaku ne pothum.. nama 4 yeTs love 8 yeRs friendship pathi yosi papa vera ethuvum yosikatha.. idhu aprM um unaku nimathi ila Santhosham Ilana un Mela promise ah solran ne ponum na poiko una na disturb pana matan 🥹",
  "Na pana thappu kaga neraiya anubavuchuta papa.. life la 1st and last ah oru vaati enakaha yoschu enkuda pesu papa nama 8 years yosi 4 years love yosi tom and Jerry acc paaru Evalo alaga Iruku nu 🥹🥹 athulam maranthudatha papa.. ne suyama yosi ne manasu vacha mudiyum papa 🥹",
  "Future la kandipa entha vishyam naalaiyum disappoint aga mata papa plss papa.. ne na Venum nenacha etha vena vjty enkita varalam.. kandipa Inime entha place laiyum un nimathi Santhosham pora Mari na nadanthuka matan enaku ne matum pothum avolotha enkuda vela vara venam enaku ethum vangi tara venam enakaha ethume pana matan .en b'day ku kuda one shirt vangi kudu 500 rs ku pothum un Mela promise ah solran 1000000% na mulu manasoda solran enaku Inime idhu pothum 🥹🥹",
];

export const SorryPage: React.FC<SorryPageProps> = ({
  onNext,
  onBackToHeart,
  audioMuted,
  toggleAudio,
  isBgmPlaying = false,
  bgmBlocked = false,
  playBgm,
}) => {
  const [photoSrc] = useState<string>(() => {
    return localStorage.getItem('sorry_photo_bg') || defaultCouplePhotoPath;
  });

  // Background BGM auto-activation listener on user interaction
  useEffect(() => {
    if (!isBgmPlaying && playBgm && !audioMuted) {
      const handleUserGesture = () => {
        playBgm();
      };
      window.addEventListener('click', handleUserGesture, { once: true });
      window.addEventListener('touchstart', handleUserGesture, { once: true });
      return () => {
        window.removeEventListener('click', handleUserGesture);
        window.removeEventListener('touchstart', handleUserGesture);
      };
    }
  }, [isBgmPlaying, playBgm, audioMuted]);

  const handleNextClick = () => {
    sounds.playTransition();
    onNext();
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between py-5 sm:py-6 px-3 sm:px-6 md:px-8 overflow-x-hidden selection:bg-pink-300 selection:text-pink-900">
      {/* 
        ========================================================================
        1. Full-Screen Background Image
        - Attached couple photograph is 100% visible, crisp & prominent
        - No heavy overlays or distracting flower textures
        ========================================================================
      */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* The Attached Photograph */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${photoSrc})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
          }}
        />

        {/* Minimal soft tint to ensure high contrast without obscuring the couple */}
        <div className="absolute inset-0 bg-black/15 pointer-events-none" />

        {/* Delicate edge vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_65%,_rgba(0,0,0,0.35)_100%)] pointer-events-none" />
      </div>

      {/* Floating micro hearts */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <span
          className="absolute top-12 left-6 sm:left-12 text-pink-400 text-lg animate-float-gentle drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
          style={{ animationDelay: '0s' }}
        >
          💖
        </span>
        <span
          className="absolute top-1/3 right-6 sm:right-12 text-black/80 text-xl animate-float-gentle drop-shadow-[0_2px_4px_rgba(255,255,255,0.5)]"
          style={{ animationDelay: '1.5s' }}
        >
          🖤
        </span>
        <span
          className="absolute bottom-24 left-8 sm:left-16 text-pink-400 text-sm animate-float-gentle drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
          style={{ animationDelay: '2.5s' }}
        >
          💖
        </span>
        <span
          className="absolute bottom-1/3 right-8 sm:right-20 text-black/80 text-xs animate-float-gentle drop-shadow-[0_2px_4px_rgba(255,255,255,0.5)]"
          style={{ animationDelay: '3.5s' }}
        >
          🖤
        </span>
      </div>

      {/* Top Bar with Navigation & Audio Controls */}
      <header className="relative z-20 w-full max-w-2xl flex items-center justify-between mb-3 sm:mb-4">
        <button
          onClick={onBackToHeart}
          className="group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/30 text-xs text-white font-medium shadow-md transition-all duration-300 backdrop-blur-md cursor-pointer"
          title="Return to the black heart"
        >
          <span className="transition-transform group-hover:-translate-x-0.5">←</span>
          <span className="text-[12px] tracking-wide">Heart</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Sound / BGM toggle */}
          <button
            onClick={toggleAudio}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-medium shadow-md transition-all duration-300 backdrop-blur-md cursor-pointer ${
              isBgmPlaying
                ? 'bg-pink-600/35 border-pink-400/60 text-pink-100 hover:bg-pink-600/50 shadow-[0_0_14px_rgba(244,114,182,0.4)]'
                : 'bg-black/40 border-white/20 text-white/60 hover:bg-black/60 hover:text-white'
            }`}
            title={isBgmPlaying ? 'Pause background music' : 'Play background music'}
          >
            {isBgmPlaying ? (
              <>
                <span className="flex items-center gap-0.5 h-3">
                  <span className="w-1 h-3 bg-pink-400 animate-pulse rounded-full" />
                  <span className="w-1 h-4 bg-pink-200 animate-pulse delay-75 rounded-full" />
                  <span className="w-1 h-2 bg-pink-400 animate-pulse delay-150 rounded-full" />
                </span>
                <span className="text-[11px] text-pink-100 font-semibold tracking-wide">BGM Playing</span>
              </>
            ) : (
              <>
                <span className="text-xs">▶</span>
                <span className="text-[11px] text-pink-200/90 font-medium">Play BGM</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* 
        ========================================================================
        2. Ultra-Sheer Reduced Visibility Letter Pad
        - Substantially reduced opacity (~18-22%) so the couple photo shines directly through
        - Subtle glass backdrop blur (3px)
        - Clean border with soft glow
        - Crystal-clear text with subtle drop halo for effortless reading
        ========================================================================
      */}
      <motion.main
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -16, scale: 0.98 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-2xl my-auto"
      >
        <div
          className="relative rounded-3xl p-5 sm:p-8 md:p-10 border border-white/20 shadow-[0_12px_32px_rgba(0,0,0,0.22)] overflow-hidden transition-all duration-300"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.11)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
          }}
        >
          {/* Ultra-sheer wash across letter pad */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/[0.06] to-white/[0.12] pointer-events-none" />

          {/* Elegant Handwritten Script Heading: “Papa sorry papa 🥹🥹” */}
          <div className="relative z-10 flex flex-col items-center text-center mb-4 sm:mb-5">
            <h1
              className="text-3xl sm:text-4xl md:text-5xl text-black font-bold tracking-wide select-none leading-normal inline-flex items-center justify-center flex-wrap gap-1.5 antialiased"
              style={{ fontFamily: '"Great Vibes", "Alex Brush", cursive' }}
            >
              <span>Papa sorry papa</span>
              <span className="text-2xl sm:text-3xl font-sans inline-block">🥹🥹</span>
            </h1>

            {/* Subtle decorative divider */}
            <div className="flex items-center gap-3 mt-1 w-full max-w-xs justify-center opacity-70">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-black to-transparent" />
              <span className="text-xs text-black">❦</span>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-black to-transparent" />
            </div>
          </div>

          {/* 
            Vertically Scrollable Message Container
            - Pure black, crystal clear, bolder text with no white shadow/overlay
          */}
          <div className="relative z-10 max-h-[50vh] sm:max-h-[56vh] overflow-y-auto pr-2 sm:pr-3.5 space-y-4 text-black font-sans scroll-smooth antialiased [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.5)_transparent]">
            {MESSAGE_PARAGRAPHS.map((paragraph, index) => (
              <p
                key={index}
                className="text-[15px] sm:text-[16px] md:text-[17px] leading-[1.8] sm:leading-[1.85] text-black font-bold text-left whitespace-pre-line tracking-normal"
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Paper footer */}
          <div className="relative z-10 mt-4 pt-2 border-t border-black/15 flex items-center justify-end text-sm">
            <span className="flex items-center gap-1">
              <span>🖤</span>
              <span>💖</span>
            </span>
          </div>
        </div>
      </motion.main>

      {/* Prominent, Aesthetic Next Button at Bottom */}
      <footer className="relative z-20 mt-4 sm:mt-5 mb-1 flex flex-col items-center">
        <motion.button
          onClick={handleNextClick}
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.96 }}
          className="group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#1c0c17]/95 via-[#33162b]/95 to-[#1c0c17]/95 border border-pink-400/50 text-pink-100 font-sans text-sm font-semibold tracking-wide shadow-[0_8px_25px_rgba(0,0,0,0.45)] hover:shadow-[0_12px_30px_rgba(180,50,110,0.6)] hover:border-pink-400/80 transition-all duration-300 cursor-pointer backdrop-blur-sm"
          aria-label="Next page to video"
        >
          {/* Ambient button glow */}
          <span className="absolute inset-0 rounded-full bg-pink-500/20 blur-md group-hover:bg-pink-500/35 transition-all duration-300 pointer-events-none" />

          <span className="relative flex items-center gap-1.5">
            <span className="text-xs">🖤</span>
            <span>Next</span>
          </span>

          <span className="relative text-pink-300 group-hover:translate-x-1 transition-transform duration-300">
            →
          </span>
        </motion.button>
      </footer>
    </div>
  );
};

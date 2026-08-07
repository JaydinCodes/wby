import { useRef } from "react";
import { motion } from "motion/react";

interface MediaIntroProps {
  onFinished: () => void;
}

const INTRO_PLAYBACK_RATE = 1.5;

export function MediaIntro({ onFinished }: MediaIntroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const finishingRef = useRef(false);

  function finishIntro() {
    if (finishingRef.current) {
      return;
    }

    finishingRef.current = true;
    onFinished();
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, filter: "blur(10px)" }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-50 overflow-hidden bg-black text-white"
    >
      <motion.video
        ref={videoRef}
        src="/media/intro.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        onLoadedMetadata={() => {
          if (videoRef.current) {
            videoRef.current.playbackRate = INTRO_PLAYBACK_RATE;
          }
        }}
        onEnded={finishIntro}
        onError={() => {
          console.error("Intro video failed to load.");
          finishIntro();
        }}
        initial={{ scale: 1.03 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.8, ease: "easeOut" }}
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_34%,rgba(0,0,0,0.62)_100%)]" />
      <div className="show-scanlines absolute inset-0 opacity-30" />

      <motion.div
        initial={{ x: "-120%" }}
        animate={{ x: "150%" }}
        transition={{ duration: 0.48, delay: 0.2, ease: "easeInOut" }}
        className="pointer-events-none absolute top-[18%] h-[2px] w-[70%] bg-gradient-to-r from-transparent via-cyan-200 to-transparent shadow-[0_0_30px_#22d3ee]"
      />

      <motion.div
        initial={{ opacity: 0, x: -28 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.25, duration: 0.35 }}
        className="absolute left-5 top-5 border-l-2 border-cyan-300 pl-3 sm:left-9 sm:top-8"
      >
        <p className="text-[0.6rem] font-black uppercase tracking-[0.42em] text-cyan-200 sm:text-xs">
          WBY // Opening Sequence
        </p>
        <p className="mt-1 text-[0.55rem] font-bold uppercase tracking-[0.26em] text-white/45 sm:text-[0.65rem]">
          Presentation speed {INTRO_PLAYBACK_RATE}x
        </p>
      </motion.div>

      <button
        type="button"
        onClick={finishIntro}
        className="absolute bottom-5 right-5 border border-white/15 bg-black/35 px-3 py-2 text-[0.65rem] font-black uppercase tracking-[0.2em] text-white/60 backdrop-blur-md transition hover:border-cyan-300/60 hover:text-white sm:bottom-8 sm:right-8"
      >
        Skip intro
      </button>
    </motion.section>
  );
}

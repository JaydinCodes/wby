import { useRef, useState } from "react";
import { Play } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface MediaIntroProps {
  onFinished: () => void;
}

export function MediaIntro({ onFinished }: MediaIntroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  async function startIntro() {
    const video = videoRef.current;

    if (!video) {
      onFinished();
      return;
    }

    try {
      setStarted(true);
      await video.play();
    } catch (error) {
      console.error("Unable to play intro video:", error);
      onFinished();
    }
  }

  function finishIntro() {
    if (isEnding) {
      return;
    }

    setIsEnding(true);

    window.setTimeout(() => {
      onFinished();
    }, 700);
  }

  return (
    <AnimatePresence>
      {!isEnding && (
        <motion.section
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black"
        >
          <video
            ref={videoRef}
            src="/media/intro.mp4"
            preload="auto"
            playsInline
            onEnded={finishIntro}
            onError={() => {
              console.error("Intro video failed to load.");
            }}
            className="h-full w-full object-contain"
          />

          {!started && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/65 backdrop-blur-sm">
              <button
                type="button"
                onClick={startIntro}
                className="group relative overflow-hidden rounded-full p-[2px]"
              >
                <span className="absolute inset-0 animate-spin-slow bg-[conic-gradient(from_0deg,#00b7ff,#315cff,#b026ff,#ff178c,#00b7ff)]" />

                <span className="relative flex items-center gap-3 rounded-full bg-[#040816] px-8 py-4 text-lg font-black uppercase tracking-wider text-white transition-transform group-hover:scale-[1.03]">
                  <Play className="size-5 fill-current" />
                  Start Games
                </span>
              </button>
            </div>
          )}

          {started && (
            <button
              type="button"
              onClick={finishIntro}
              className="absolute bottom-6 right-6 rounded-lg border border-white/20 bg-black/50 px-4 py-2 text-sm font-semibold text-white/70 backdrop-blur transition hover:text-white"
            >
              Skip intro
            </button>
          )}
        </motion.section>
      )}
    </AnimatePresence>
  );
}
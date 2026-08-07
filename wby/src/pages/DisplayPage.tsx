import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { motion } from "motion/react";
import type { Team } from "../types/team";
import { Leaderboard } from "../components/Leaderboard";
import { MediaIntro } from "../components/MediaIntro";

interface DisplayPageProps {
  teams: Team[];
}

export function DisplayPage({ teams }: DisplayPageProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [introFinished, setIntroFinished] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  async function handleIntroFinished() {
    setIntroFinished(true);

    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    try {
      audio.currentTime = 0;
      await audio.play();
    } catch (error) {
      console.error("Unable to play leaderboard music:", error);
    }
  }

  function toggleMute() {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
  }

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  return (
    <>
      <audio
        ref={audioRef}
        src="/media/leaderboard-song.mp3"
        preload="auto"
        loop
      />

      {!introFinished && (
        <MediaIntro onFinished={handleIntroFinished} />
      )}

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: introFinished ? 1 : 0 }}
        transition={{ duration: 0.8 }}
        className="
          relative min-h-[100dvh] overflow-x-hidden bg-[#02040c] text-white
          px-[max(0.75rem,env(safe-area-inset-left))]
          pb-[max(1rem,env(safe-area-inset-bottom))]
          pt-[max(0.75rem,env(safe-area-inset-top))]
          sm:px-6 sm:py-6
          lg:px-10 lg:py-8
        "
      >
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute -left-40 top-0 size-[420px] rounded-full bg-blue-600/20 blur-[120px] sm:size-[600px] sm:blur-[150px]" />

          <div className="absolute -right-40 bottom-0 size-[430px] rounded-full bg-pink-600/20 blur-[120px] sm:size-[650px] sm:blur-[160px]" />

          <div className="absolute left-1/2 top-1/2 size-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/10 blur-[120px]" />
        </div>

        <div className="relative mx-auto w-full max-w-[1600px]">
          <header className="mb-4 border-b border-white/10 pb-4 sm:mb-6 sm:pb-5 lg:mb-8 lg:pb-6">
            <div className="flex items-start justify-between gap-3 sm:items-center sm:gap-6">
              <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-5 lg:gap-6">
                <img
                  src="/images/wby-logo.png"
                  alt="Westridge Baptist Youth"
                  className="h-14 w-14 shrink-0 object-contain sm:h-20 sm:w-auto lg:h-28"
                />

                <div className="min-w-0">
                  <h1 className="text-[clamp(1.15rem,5vw,3rem)] font-black leading-[1.05] tracking-tight">
                    Westridge Baptist Youth Games
                  </h1>

                  <p className="mt-1 text-sm font-semibold text-cyan-300 sm:mt-2 sm:text-lg lg:text-2xl">
                    Live Team Tracker
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute music" : "Mute music"}
                title={isMuted ? "Unmute music" : "Mute music"}
                className="
                  grid size-10 shrink-0 place-items-center rounded-full
                  border border-white/15 bg-white/5 text-white/70
                  backdrop-blur transition
                  hover:border-pink-400 hover:text-white
                  active:scale-95
                  sm:flex sm:h-auto sm:w-auto sm:gap-2 sm:rounded-xl
                  sm:px-4 sm:py-2
                "
              >
                {isMuted ? (
                  <VolumeX className="size-5" />
                ) : (
                  <Volume2 className="size-5" />
                )}

                <span className="hidden text-sm font-semibold sm:inline">
                  {isMuted ? "Unmute" : "Mute"}
                </span>
              </button>
            </div>
          </header>

          <Leaderboard teams={teams} />

          <footer className="mt-5 text-center text-[0.65rem] font-semibold tracking-[0.2em] text-white/50 sm:mt-7 sm:text-sm sm:tracking-[0.35em] lg:text-lg">
            FAITH. FRIENDSHIP. FUN.
          </footer>
        </div>
      </motion.main>
    </>
  );
}
import { useEffect, useRef, useState } from "react";
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
        className="relative min-h-screen overflow-hidden bg-[#02040c] px-4 py-6 text-white md:px-10 md:py-8"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 top-0 size-[600px] rounded-full bg-blue-600/20 blur-[140px]" />
          <div className="absolute -right-40 bottom-0 size-[650px] rounded-full bg-pink-600/20 blur-[150px]" />
        </div>

        <div className="relative mx-auto max-w-[1600px]">
          <header className="mb-8 flex items-center justify-between gap-6 border-b border-white/10 pb-6">
            <div className="flex items-center gap-6">
              <img
                src="/images/wby-logo.png"
                alt="Westridge Baptist Youth"
                className="h-20 w-auto object-contain md:h-28"
              />

              <div>
                <h1 className="text-2xl font-black md:text-5xl">
                  Westridge Baptist Youth Games
                </h1>

                <p className="mt-2 text-lg text-cyan-300 md:text-2xl">
                  Live Team Tracker
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleMute}
              className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70 transition hover:border-pink-400 hover:text-white"
            >
              {isMuted ? "Unmute music" : "Mute music"}
            </button>
          </header>

          <Leaderboard teams={teams} />

          <footer className="mt-8 text-center text-sm font-semibold tracking-[0.35em] text-white/60 md:text-lg">
            FAITH. FRIENDSHIP. FUN.
          </footer>
        </div>
      </motion.main>
    </>
  );
}
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ChevronsRight,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
} from "motion/react";

import type { Team } from "../types/team";
import type { ShowStage } from "../types/show";

import { Leaderboard } from "../components/Leaderboard";
import { MediaIntro } from "../components/MediaIntro";
import { TeamReveal } from "../components/TeamReveal";
import { GamesBegin } from "../components/GamesBegin";

import {
  chosenReveal,
  eaglesReveal,
  pathfindersReveal,
  warriorsReveal,
} from "../data/teamReveals";

interface DisplayPageProps {
  teams: Team[];
}

const MEDIA_PREFETCH_BY_STAGE: Partial<
  Record<ShowStage, string[]>
> = {
  waiting: ["/media/intro.mp4"],
  intro: [chosenReveal.video, eaglesReveal.video],
  chosen: [eaglesReveal.video, pathfindersReveal.video],
  eagles: [pathfindersReveal.video, warriorsReveal.video],
  pathfinders: [warriorsReveal.video],
};

const NEXT_STAGE: Partial<Record<ShowStage, ShowStage>> = {
  intro: "chosen",
  chosen: "eagles",
  eagles: "pathfinders",
  pathfinders: "warriors",
  warriors: "games-begin",
  "games-begin": "leaderboard",
};

function prefetchMedia(urls: string[]) {
  const links = urls.map((url) => {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = url;

    if (url.endsWith(".mp4")) {
      link.as = "video";
    } else if (url.endsWith(".mp3")) {
      link.as = "audio";
    }

    document.head.appendChild(link);
    return link;
  });

  return () => {
    links.forEach((link) => link.remove());
  };
}

export function DisplayPage({
  teams,
}: DisplayPageProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [stage, setStage] =
    useState<ShowStage>("waiting");

  const [isMuted, setIsMuted] = useState(false);

  const startSoundtrack = useCallback(async () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.currentTime = 0;

    try {
      await audio.play();
    } catch (error) {
      console.error(
        "Unable to start presentation audio:",
        error,
      );
    }
  }, []);

  async function startGames() {
    await startSoundtrack();
    setStage("intro");
  }

  async function skipPresentationFromStart() {
    await startSoundtrack();
    setStage("leaderboard");
  }

  function skipCurrentStage() {
    const nextStage = NEXT_STAGE[stage];

    if (nextStage) {
      setStage(nextStage);
    }
  }

  function skipAllPresentation() {
    setStage("leaderboard");
  }

  function toggleMute() {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
  }

  const finishIntro = useCallback(() => {
    setStage("chosen");
  }, []);

  const finishChosen = useCallback(() => {
    setStage("eagles");
  }, []);

  const finishEagles = useCallback(() => {
    setStage("pathfinders");
  }, []);

  const finishPathfinders = useCallback(() => {
    setStage("warriors");
  }, []);

  const finishWarriors = useCallback(() => {
    setStage("games-begin");
  }, []);

  const finishGamesBegin = useCallback(() => {
    setStage("leaderboard");
  }, []);

  useEffect(() => {
    const urls = MEDIA_PREFETCH_BY_STAGE[stage];

    if (!urls?.length) {
      return;
    }

    return prefetchMedia(urls);
  }, [stage]);

  useEffect(() => {
    const audio = audioRef.current;

    return () => {
      audio?.pause();
    };
  }, []);

  const showSkipControls =
    stage !== "waiting" && stage !== "leaderboard";

  return (
    <>
      <audio
        ref={audioRef}
        src="/media/leaderboard-song.mp3"
        preload="auto"
        loop
      />

      <AnimatePresence mode="sync">
        {stage === "waiting" && (
          <StartScreen
            key="waiting"
            onStart={startGames}
            onSkipPresentation={skipPresentationFromStart}
          />
        )}

        {stage === "intro" && (
          <MediaIntro
            key="intro"
            onFinished={finishIntro}
          />
        )}

        {stage === "chosen" && (
          <TeamReveal
            key="chosen"
            team={chosenReveal}
            onFinished={finishChosen}
          />
        )}

        {stage === "eagles" && (
          <TeamReveal
            key="eagles"
            team={eaglesReveal}
            onFinished={finishEagles}
          />
        )}

        {stage === "pathfinders" && (
          <TeamReveal
            key="pathfinders"
            team={pathfindersReveal}
            onFinished={finishPathfinders}
          />
        )}

        {stage === "warriors" && (
          <TeamReveal
            key="warriors"
            team={warriorsReveal}
            onFinished={finishWarriors}
          />
        )}

        {stage === "games-begin" && (
          <GamesBegin
            key="games-begin"
            onFinished={finishGamesBegin}
          />
        )}

        {stage === "leaderboard" && (
          <LeaderboardScreen
            key="leaderboard"
            teams={teams}
            isMuted={isMuted}
            onToggleMute={toggleMute}
          />
        )}
      </AnimatePresence>

      {showSkipControls && (
        <PresentationSkipControls
          onSkipStage={skipCurrentStage}
          onSkipAll={skipAllPresentation}
        />
      )}
    </>
  );
}

interface PresentationSkipControlsProps {
  onSkipStage: () => void;
  onSkipAll: () => void;
}

function PresentationSkipControls({
  onSkipStage,
  onSkipAll,
}: PresentationSkipControlsProps) {
  return (
    <div className="fixed bottom-5 right-5 z-[120] flex items-center gap-2 sm:bottom-8 sm:right-8">
      <button
        type="button"
        onClick={onSkipStage}
        className="rounded-lg border border-white/15 bg-black/55 px-3 py-2 text-[0.62rem] font-black uppercase tracking-[0.16em] text-white/65 backdrop-blur-md transition hover:border-cyan-300/60 hover:text-white active:scale-95 sm:px-4 sm:text-xs"
      >
        Skip Stage
      </button>

      <button
        type="button"
        onClick={onSkipAll}
        className="flex items-center gap-2 rounded-lg border border-pink-400/35 bg-pink-500/10 px-3 py-2 text-[0.62rem] font-black uppercase tracking-[0.16em] text-pink-200 backdrop-blur-md transition hover:border-pink-300 hover:bg-pink-500/20 active:scale-95 sm:px-4 sm:text-xs"
      >
        <ChevronsRight className="size-4" />
        Skip All
      </button>
    </div>
  );
}

interface StartScreenProps {
  onStart: () => Promise<void>;
  onSkipPresentation: () => Promise<void>;
}

function StartScreen({
  onStart,
  onSkipPresentation,
}: StartScreenProps) {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-[#02040c] px-5 text-white"
    >
      <div className="show-ambient pointer-events-none absolute inset-0" />
      <div className="show-grid pointer-events-none absolute inset-0 opacity-30" />
      <div className="show-scanlines pointer-events-none absolute inset-0 opacity-25" />

      <motion.div
        initial={{ x: "-120%" }}
        animate={{ x: "150%" }}
        transition={{ duration: 0.7, delay: 0.35, ease: "easeInOut" }}
        className="pointer-events-none absolute top-[24%] h-[2px] w-[72%] bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_35px_#22d3ee]"
      />

      <div className="relative w-full max-w-5xl text-center">
        <motion.img
          src="/images/wby-logo.png"
          alt="Westridge Baptist Youth"
          initial={{ opacity: 0, y: -24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.45 }}
          className="mx-auto mb-6 h-24 w-auto object-contain drop-shadow-[0_0_28px_rgba(34,211,238,0.35)] sm:h-32"
        />

        <motion.p
          initial={{ opacity: 0, x: -28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="mb-2 text-[0.62rem] font-black uppercase tracking-[0.52em] text-cyan-300 sm:text-sm"
        >
          Westridge Baptist Youth
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, scale: 1.2, skewX: -8 }}
          animate={{ opacity: 1, scale: 1, skewX: -5 }}
          transition={{ delay: 0.42, type: "spring", stiffness: 240, damping: 18 }}
          className="impact-title mb-9 text-[clamp(3.4rem,10vw,8rem)] font-black uppercase leading-[0.8] tracking-[-0.07em]"
        >
          Youth Games
        </motion.h1>

        <motion.button
          type="button"
          onClick={() => void onStart()}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.035 }}
          whileTap={{ scale: 0.98 }}
          transition={{ delay: 0.62, duration: 0.28 }}
          className="group relative mx-auto block min-w-[260px] sm:min-w-[340px]"
        >
          <span className="start-slash-panel absolute -inset-[2px] bg-gradient-to-r from-cyan-300 via-white to-pink-500 shadow-[0_0_34px_rgba(34,211,238,0.4)]" />
          <span className="start-slash-panel relative flex items-center justify-center gap-3 bg-[#050817] px-8 py-4 text-base font-black uppercase tracking-[0.2em] transition-colors group-hover:bg-[#091128] sm:px-12 sm:py-5 sm:text-xl">
            <Play className="size-5 fill-current" />
            Start Games
          </span>
        </motion.button>

        <motion.button
          type="button"
          onClick={() => void onSkipPresentation()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.25 }}
          className="mx-auto mt-4 flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white/45 transition hover:text-white sm:text-sm"
        >
          <ChevronsRight className="size-4" />
          Skip presentation
        </motion.button>
      </div>
    </motion.main>
  );
}

interface LeaderboardScreenProps {
  teams: Team[];
  isMuted: boolean;
  onToggleMute: () => void;
}

function LeaderboardScreen({
  teams,
  isMuted,
  onToggleMute,
}: LeaderboardScreenProps) {
  return (
    <motion.main
      initial={{
        opacity: 0,
        scale: 1.03,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7 }}
      className="
        relative min-h-[100dvh]
        overflow-x-hidden
        bg-[#02040c]
        text-white
        px-[max(0.75rem,env(safe-area-inset-left))]
        pb-[max(1rem,env(safe-area-inset-bottom))]
        pt-[max(0.75rem,env(safe-area-inset-top))]
        sm:px-6 sm:py-6
        lg:px-10 lg:py-8
      "
    >
      <div className="show-ambient pointer-events-none fixed inset-0" />

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
              onClick={onToggleMute}
              aria-label={
                isMuted
                  ? "Unmute music"
                  : "Mute music"
              }
              title={
                isMuted
                  ? "Unmute music"
                  : "Mute music"
              }
              className="
                grid size-10 shrink-0 place-items-center
                rounded-full border border-white/15
                bg-white/5 text-white/70 backdrop-blur
                transition hover:border-pink-400 hover:text-white
                active:scale-95
                sm:flex sm:h-auto sm:w-auto sm:gap-2
                sm:rounded-xl sm:px-4 sm:py-2
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
  );
}

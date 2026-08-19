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
import { AmbientBattleFX } from "../components/AmbientBattleFX";
import { Leaderboard } from "../components/Leaderboard";
import { MediaIntro } from "../components/MediaIntro";
import { TeamReveal } from "../components/TeamReveal";
import { GamesBegin } from "../components/GamesBegin";
import { GraffitiOverlay } from "../components/GraffitiOverlay";
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
  intro: [
    chosenReveal.video,
    eaglesReveal.video,
  ],
  chosen: [
    eaglesReveal.video,
    pathfindersReveal.video,
  ],
  eagles: [
    pathfindersReveal.video,
    warriorsReveal.video,
  ],
  pathfinders: [
    warriorsReveal.video,
  ],
};

const NEXT_STAGE: Partial<
  Record<ShowStage, ShowStage>
> = {
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
  const audioRef =
    useRef<HTMLAudioElement | null>(null);

  const [stage, setStage] =
    useState<ShowStage>("waiting");

  const [isMuted, setIsMuted] =
    useState(false);

  const startSoundtrack =
    useCallback(async () => {
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

  const finishPathfinders =
    useCallback(() => {
      setStage("warriors");
    }, []);

  const finishWarriors =
    useCallback(() => {
      setStage("games-begin");
    }, []);

  const finishGamesBegin =
    useCallback(() => {
      setStage("leaderboard");
    }, []);

  useEffect(() => {
    const urls =
      MEDIA_PREFETCH_BY_STAGE[stage];

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
    stage !== "waiting" &&
    stage !== "leaderboard";

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
            onSkipPresentation={
              skipPresentationFromStart
            }
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
            onFinished={
              finishPathfinders
            }
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
            onFinished={
              finishGamesBegin
            }
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
        className="
          rounded-lg
          border border-white/15
          bg-black/55
          px-3 py-2
          text-[0.62rem]
          font-black uppercase
          tracking-[0.16em]
          text-white/65
          backdrop-blur-md
          transition
          hover:border-cyan-300/60
          hover:text-white
          active:scale-95
          sm:px-4
          sm:text-xs
        "
      >
        Skip Stage
      </button>

      <button
        type="button"
        onClick={onSkipAll}
        className="
          flex items-center gap-2
          rounded-lg
          border border-pink-400/35
          bg-pink-500/10
          px-3 py-2
          text-[0.62rem]
          font-black uppercase
          tracking-[0.16em]
          text-pink-200
          backdrop-blur-md
          transition
          hover:border-pink-300
          hover:bg-pink-500/20
          active:scale-95
          sm:px-4
          sm:text-xs
        "
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
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
        scale: 1.04,
      }}
      transition={{
        duration: 0.3,
      }}
      className="
        fixed inset-0
        z-[100]
        grid
        place-items-center
        overflow-hidden
        bg-[#02040c]
        px-5
        text-white
      "
    >
      <div className="show-ambient pointer-events-none absolute inset-0" />

      <div className="show-grid pointer-events-none absolute inset-0 opacity-30" />

      <div className="show-scanlines pointer-events-none absolute inset-0 opacity-25" />

      <motion.div
        initial={{
          x: "-120%",
        }}
        animate={{
          x: "150%",
        }}
        transition={{
          duration: 0.7,
          delay: 0.35,
          ease: "easeInOut",
        }}
        className="
          pointer-events-none
          absolute
          top-[24%]
          h-[2px]
          w-[72%]
          bg-gradient-to-r
          from-transparent
          via-cyan-300
          to-transparent
          shadow-[0_0_35px_#22d3ee]
        "
      />

      <div className="relative w-full max-w-5xl text-center">
        <motion.img
          src="/images/wby-logo.png"
          alt="Westridge Baptist Youth"
          initial={{
            opacity: 0,
            y: -24,
            scale: 0.9,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            delay: 0.15,
            duration: 0.45,
          }}
          className="
            mx-auto
            mb-6
            h-24
            w-auto
            object-contain
            drop-shadow-[0_0_28px_rgba(34,211,238,0.35)]
            sm:h-32
          "
        />

        <motion.p
          initial={{
            opacity: 0,
            x: -28,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            delay: 0.3,
            duration: 0.3,
          }}
          className="
            mb-2
            text-[0.62rem]
            font-black
            uppercase
            tracking-[0.52em]
            text-cyan-300
            sm:text-sm
          "
        >
          Westridge Baptist Youth
        </motion.p>

        <motion.h1
          initial={{
            opacity: 0,
            scale: 1.2,
            skewX: -8,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            skewX: -5,
          }}
          transition={{
            delay: 0.42,
            type: "spring",
            stiffness: 240,
            damping: 18,
          }}
          className="
            impact-title
            mb-9
            text-[clamp(3.4rem,10vw,8rem)]
            font-black
            uppercase
            leading-[0.8]
            tracking-[-0.07em]
          "
        >
          Youth Games
        </motion.h1>

        <motion.button
          type="button"
          onClick={() => void onStart()}
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          whileHover={{
            scale: 1.035,
          }}
          whileTap={{
            scale: 0.98,
          }}
          transition={{
            delay: 0.62,
            duration: 0.28,
          }}
          className="
            group
            relative
            mx-auto
            block
            min-w-[260px]
            sm:min-w-[340px]
          "
        >
          <span
            className="
              start-slash-panel
              absolute
              -inset-[2px]
              bg-gradient-to-r
              from-cyan-300
              via-white
              to-pink-500
              shadow-[0_0_34px_rgba(34,211,238,0.4)]
            "
          />

          <span
            className="
              start-slash-panel
              relative
              flex
              items-center
              justify-center
              gap-3
              bg-[#050817]
              px-8
              py-4
              text-base
              font-black
              uppercase
              tracking-[0.2em]
              transition-colors
              group-hover:bg-[#091128]
              sm:px-12
              sm:py-5
              sm:text-xl
            "
          >
            <Play className="size-5 fill-current" />
            Start Games
          </span>
        </motion.button>

        <motion.button
          type="button"
          onClick={() =>
            void onSkipPresentation()
          }
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.8,
            duration: 0.25,
          }}
          className="
            mx-auto
            mt-4
            flex
            items-center
            gap-2
            px-4
            py-2
            text-xs
            font-black
            uppercase
            tracking-[0.18em]
            text-white/45
            transition
            hover:text-white
            sm:text-sm
          "
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
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      transition={{
        duration: 0.45,
      }}
      className="
        battle-screen
        relative
        min-h-[100dvh]
        overflow-hidden
        bg-[#02030a]
        text-white
      "
    >
      {/* =========================================
          BACKGROUND
      ========================================== */}

      <div className="battle-bg-glow pointer-events-none absolute inset-0" />

      <div className="battle-grid pointer-events-none absolute inset-0" />

      <div className="battle-noise pointer-events-none absolute inset-0" />
      <GraffitiOverlay/>
      <AmbientBattleFX/>
     

    
      {/* =========================================
          MAIN CONTENT
      ========================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          flex
          h-[100dvh]
          w-full
          max-w-[1700px]
          flex-col
          px-5
          py-4
          sm:px-8
          lg:px-12
        "
      >
        {/* =======================================
            TOP BAR
        ======================================== */}

        <header className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-4 lg:gap-6">
            <img
              src="/images/wby-logo.png"
              alt="Westridge Baptist Youth"
              className="
                h-16
                w-auto
                object-contain
                lg:h-20
              "
            />

            <div>
              <h1
                className="
                  text-xl
                  font-black
                  leading-none
                  tracking-tight
                  sm:text-2xl
                  lg:text-4xl
                "
              >
                Westridge Baptist Youth Games
              </h1>

              <p
                className="
                  mt-2
                  text-xs
                  font-bold
                  tracking-wide
                  text-cyan-300
                  sm:text-sm
                  lg:text-lg
                "
              >
                Live Team Tracker
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleMute}
            className="
              flex
              items-center
              gap-2
              border
              border-cyan-300/70
              bg-black/60
              px-4
              py-2
              text-xs
              font-black
              uppercase
              tracking-[0.12em]
              shadow-[0_0_16px_rgba(34,211,238,0.18)]
              backdrop-blur
              transition
              hover:border-pink-400
              hover:shadow-[0_0_20px_rgba(236,72,153,0.28)]
            "
          >
            {isMuted ? (
              <VolumeX className="size-4" />
            ) : (
              <Volume2 className="size-4" />
            )}

            <span className="hidden sm:inline">
              {isMuted
                ? "Unmute"
                : "Mute"}
            </span>
          </button>
        </header>

        {/* =======================================
            MAIN GRAFFITI TITLE
        ======================================== */}

        <section
          className="
            battle-hero
            relative
            z-20
            mt-3
            grid
            items-center
            gap-6
            lg:grid-cols-[minmax(0,1fr)_240px]
            lg:gap-8
          "
        >
          <motion.div
            initial={{
              opacity: 0,
              x: -60,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.55,
              ease: "easeOut",
            }}
            className="
              battle-title-wrap
              relative
            "
          >
            {/* Cyan paint */}
            <div
              className="
                battle-title-splatter
                battle-title-splatter--cyan
              "
              aria-hidden="true"
            />

            {/* Pink paint */}
            <div
              className="
                battle-title-splatter
                battle-title-splatter--pink
              "
              aria-hidden="true"
            />

            {/* Gold paint */}
            <div
              className="
                battle-title-splatter
                battle-title-splatter--gold
              "
              aria-hidden="true"
            />

            {/* Speed lines */}
            <div
              className="
                battle-title-speedline
                battle-title-speedline--top
              "
              aria-hidden="true"
            />

            <div
              className="
                battle-title-speedline
                battle-title-speedline--bottom
              "
              aria-hidden="true"
            />

            {/* Tiny HUD label */}
            <div className="battle-title-meta">
              <span className="battle-title-meta__line" />

              <span>
                WBY // TEAM RANKINGS
              </span>
            </div>

            <div className="battle-title-stack">
              <div className="battle-title-row">
                <span
                  className="battle-title-live"
                  data-text="LIVE"
                >
                  LIVE
                </span>

                <span
                  className="battle-title-board"
                  data-text="LEADERBOARD"
                >
                  LEADERBOARD
                </span>
              </div>

              {/* Slash underlines */}
              <div className="battle-title-underlines">
                <span className="battle-title-underlines__cyan" />
                <span className="battle-title-underlines__white" />
                <span className="battle-title-underlines__pink" />
              </div>
            </div>
          </motion.div>

          {/* =====================================
              LIVE STATUS HUD
          ====================================== */}

          <motion.aside
            initial={{
              opacity: 0,
              x: 40,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              delay: 0.15,
              duration: 0.45,
            }}
            className="
              battle-status-card
              hidden
              lg:block
            "
          >
            <div className="battle-status-card__dot" />

            <div className="battle-status-card__content">
              <span className="battle-status-card__eyebrow">
                Live Update
              </span>

              <span className="battle-status-card__title">
                Current Standings
              </span>

              <div className="battle-status-card__bars">
                <span />
                <span />
                <span />
              </div>
            </div>
          </motion.aside>
        </section>

        {/* =======================================
            LEADERBOARD
        ======================================== */}

        <div className="relative mt-5 min-h-[360px] flex-1">
          {/* graffiti strip behind rows */}
          <div
            className="
              pointer-events-none
              absolute
              -left-10
              top-[8%]
              z-0
              h-[28%]
              w-[38%]
              -rotate-[4deg]
              opacity-[0.09]
            "
            aria-hidden="true"
          >
            
          </div>

          <div
            className="
              pointer-events-none
              absolute
              -right-12
              bottom-[6%]
              z-0
              h-[30%]
              w-[34%]
              rotate-[5deg]
              opacity-[0.07]
            "
            aria-hidden="true"
          >
          
          </div>
          <div className="relative mt-4 min-h-0 flex-[1_1_0%]">
            <div className="relative z-10 h-full">
            <Leaderboard teams={teams} />
          </div>
          </div>
          
        </div>

        {/* =======================================
            BOTTOM BROADCAST HUD
        ======================================== */}

        <footer
          className="
            relative
            mt-5
            grid
            grid-cols-3
            items-center
            border-t
            border-white/10
            py-3
            text-[0.65rem]
            font-black
            uppercase
            tracking-[0.18em]
            text-white/45
            sm:text-xs
          "
        >
          {/* cyan slash */}
          <span
            className="
              pointer-events-none
              absolute
              -top-[2px]
              left-0
              h-[3px]
              w-[14%]
              -skew-x-[35deg]
              bg-cyan-400
              shadow-[0_0_12px_rgba(34,211,238,0.55)]
            "
          />

          {/* pink slash */}
          <span
            className="
              pointer-events-none
              absolute
              -top-[2px]
              right-[16%]
              h-[3px]
              w-[9%]
              -skew-x-[35deg]
              bg-pink-500
              shadow-[0_0_12px_rgba(236,72,153,0.45)]
            "
          />

          <div className="flex items-center gap-3">
            <span className="relative flex size-2">
              <span
                className="
                  absolute
                  inline-flex
                  size-full
                  animate-ping
                  rounded-full
                  bg-pink-500
                  opacity-50
                "
              />

              <span
                className="
                  relative
                  inline-flex
                  size-2
                  rounded-full
                  bg-pink-500
                  shadow-[0_0_10px_#ec4899]
                "
              />
            </span>

            <span className="text-pink-400">
              Live
            </span>

            <span className="hidden sm:inline">
              Youth Games 2026
            </span>
          </div>

          <div className="text-center">
            Courage. Faith. Impact.
          </div>

          <div className="text-right">
            Westridge Strong
          </div>
        </footer>
      </div>
    </motion.main>
  );
}
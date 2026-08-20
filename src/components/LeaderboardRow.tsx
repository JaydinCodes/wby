import {
  AnimatePresence,
  motion,
} from "motion/react";
import {
  Crown,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  useEffect,
  useRef,
} from "react";
import type { CSSProperties } from "react";

import type { Team } from "../types/team";

interface LeaderboardRowProps {
  team: Team;
  rank: number;
  isPriority: boolean;
}

function usePrevious<T>(value: T) {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

export function LeaderboardRow({
  team,
  rank,
  isPriority,
}: LeaderboardRowProps) {
  const previousScore = usePrevious(team.score);
  const previousRank = usePrevious(rank);

  const scoreDelta =
    previousScore === undefined
      ? 0
      : team.score - previousScore;

  // Positive = team moved UP.
  const rankDelta =
    previousRank === undefined
      ? 0
      : previousRank - rank;

  const rankChanged = rankDelta !== 0;

  const justTookLead =
    previousRank !== undefined &&
    previousRank > 1 &&
    rank === 1;

  const style = {
    "--team-accent": team.accent,
    "--team-glow": team.accentGlow,
    "--mobile-name-size":
      team.name.length >= 16
        ? "clamp(1.05rem, calc(3vw + 0.5rem), 1.55rem)"
        : team.name.length >= 12
          ? "clamp(1.25rem, calc(3.5vw + 0.55rem), 1.9rem)"
          : "clamp(1.4rem, calc(4.1vw + 0.55rem), 2.15rem)",
    "--hero-position":
      team.heroPosition ?? "76% 50%",
    "--hero-scale": String(
      team.heroScale ?? 1.08,
    ),
  } as CSSProperties;

  return (
    <motion.li
      layout
      initial={{
        opacity: 0,
        x: -100,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      transition={{
        opacity: {
          duration: 0.25,
        },
        x: {
          type: "spring",
          stiffness: 280,
          damping: 27,
        },
        layout: {
          type: "spring",
          stiffness: 320,
          damping: 28,
          mass: 0.85,
        },
      }}
      style={style}
      className={[
        "leaderboard-row",
        justTookLead
          ? "leaderboard-row--lead-takeover"
          : "",
      ].join(" ")}
    >
      {/* =====================================
          BORDER
      ====================================== */}

      <div
        className="leaderboard-row__edge"
        aria-hidden="true"
      />

      {/* =====================================
          ARTWORK
      ====================================== */}

      <div className="leaderboard-row__panel">
        <div
          className="leaderboard-row__art"
          aria-hidden="true"
        >
          <picture>
            <source
              media="(max-width: 820px)"
              srcSet={team.mobileHeroImage}
            />
            <img
              src={team.desktopHeroImage}
              alt=""
              decoding="async"
              loading="eager"
              fetchPriority={isPriority ? "high" : "auto"}
            />
          </picture>
        </div>

        <div
          className="leaderboard-row__art-fade"
          aria-hidden="true"
        />

        <div
          className="leaderboard-row__texture"
          aria-hidden="true"
        />

        <div
          className="leaderboard-row__energy"
          aria-hidden="true"
        />
      </div>

      {/* =====================================
          SCORE CHANGE ENERGY BLAST
      ====================================== */}

      <AnimatePresence initial={false}>
        {scoreDelta !== 0 && (
          <motion.div
            key={`score-fx-${team.score}`}
            initial={{
              opacity: 0,
              scaleX: 0,
            }}
            animate={{
              opacity: [
                0,
                0.95,
                0.55,
                0,
              ],
              scaleX: [
                0,
                0.35,
                1,
                1.15,
              ],
            }}
            transition={{
              duration: 0.72,
              ease: "easeOut",
            }}
            className="leaderboard-row__event-flash"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* =====================================
          RANK CHANGE FLASH
      ====================================== */}

      <AnimatePresence initial={false}>
        {rankChanged && (
          <motion.div
            key={`rank-fx-${rank}`}
            initial={{
              opacity: 0,
              x: rankDelta > 0
                ? -100
                : 100,
            }}
            animate={{
              opacity: [
                0,
                0.55,
                0,
              ],
              x: [
                rankDelta > 0
                  ? -100
                  : 100,
                0,
                rankDelta > 0
                  ? 80
                  : -80,
              ],
            }}
            transition={{
              duration: 0.65,
              ease: "easeOut",
            }}
            className="leaderboard-row__rank-energy"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* =====================================
          NEW LEADER CALLOUT
      ====================================== */}

      <AnimatePresence initial={false}>
        {justTookLead && (
          <motion.div
            key={`leader-${team.id}-${team.score}`}
            initial={{
              opacity: 0,
              scale: 1.5,
              y: -18,
            }}
            animate={{
              opacity: [
                0,
                1,
                1,
                0,
              ],
              scale: [
                1.5,
                1,
                1,
                0.95,
              ],
              y: [
                -18,
                0,
                0,
                -8,
              ],
            }}
            transition={{
              duration: 1.7,
              times: [
                0,
                0.16,
                0.72,
                1,
              ],
            }}
            className="leaderboard-row__leader-callout"
          >
            <Crown />
            New Leader
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================
          CONTENT
      ====================================== */}

      <div className="leaderboard-row__content">
        {/* RANK */}

        <section
          className="leaderboard-row__rank"
          aria-label={`Rank ${rank}`}
        >
          <span className="leaderboard-row__micro-label">
            Rank
          </span>

          {rank <= 3 && (
            <Crown
              className="leaderboard-row__crown"
              strokeWidth={2.5}
              aria-hidden="true"
            />
          )}

          <motion.span
            key={rank}
            initial={{
              scale: 1.6,
              y: rankDelta > 0
                ? 26
                : -26,
              opacity: 0,
              filter:
                "brightness(2.5)",
            }}
            animate={{
              scale: 1,
              y: 0,
              opacity: 1,
              filter:
                "brightness(1)",
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 23,
            }}
            className="leaderboard-row__rank-number"
          >
            {rank}
          </motion.span>

          <AnimatePresence initial={false}>
            {rankChanged && (
              <motion.div
                key={`rank-delta-${rank}`}
                initial={{
                  opacity: 0,
                  y: 8,
                  scale: 0.7,
                }}
                animate={{
                  opacity: [
                    0,
                    1,
                    1,
                    0,
                  ],
                  y: [
                    8,
                    0,
                    0,
                    -7,
                  ],
                  scale: [
                    0.7,
                    1,
                    1,
                    0.9,
                  ],
                }}
                transition={{
                  duration: 1.4,
                }}
                className={[
                  "leaderboard-row__rank-delta",
                  rankDelta > 0
                    ? "leaderboard-row__rank-delta--up"
                    : "leaderboard-row__rank-delta--down",
                ].join(" ")}
              >
                {rankDelta > 0 ? (
                  <TrendingUp />
                ) : (
                  <TrendingDown />
                )}

                {Math.abs(rankDelta)}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* TEAM */}

        <section className="leaderboard-row__team">
  <div className="leaderboard-row__identity">
    <div className="leaderboard-row__team-code">
      <span>WBY</span>
      <span>//</span>
      <span>
        TEAM {String(rank).padStart(2, "0")}
      </span>
    </div>

    <div className="leaderboard-row__name-wrap">
      <span
        className="leaderboard-row__name-slash"
        aria-hidden="true"
      />

      <span
        className="leaderboard-row__name-accent"
        aria-hidden="true"
      />

      <span
        data-text={team.name}
        className="leaderboard-row__name"
      >
        {team.name}
      </span>
    </div>

    <div
      className="leaderboard-row__meter"
      aria-hidden="true"
    >
      <span />
      <span />
      <span />
      <span />
    </div>
  </div>

  <div
    className="leaderboard-row__team-marker"
    aria-hidden="true"
  >
    <span />
    <span />
    <span />
  </div>
</section>

        {/* SCORE */}

        <section
          className="leaderboard-row__score"
          aria-label={`${team.score} points`}
          aria-live="polite"
        >
          <motion.div
            key={`score-flash-${team.score}`}
            initial={{
              opacity: 0.8,
              scaleX: 0.05,
            }}
            animate={{
              opacity: 0,
              scaleX: 1.25,
            }}
            transition={{
              duration: 0.65,
              ease: "easeOut",
            }}
            className="leaderboard-row__score-flash"
            aria-hidden="true"
          />

          <div className="leaderboard-row__score-topline">
            <span>Points</span>

            <span
              className="leaderboard-row__score-dot"
              aria-hidden="true"
            />
          </div>

          <motion.span
            key={team.score}
            initial={{
              scale: 1.7,
              rotate: -4,
              filter:
                "brightness(3)",
            }}
            animate={{
              scale: 1,
              rotate: 0,
              filter:
                "brightness(1)",
            }}
            transition={{
              type: "spring",
              stiffness: 520,
              damping: 21,
            }}
            className="leaderboard-row__score-number"
          >
            {team.score}
          </motion.span>

          <AnimatePresence initial={false}>
            {scoreDelta !== 0 && (
              <motion.span
                key={`delta-${team.score}`}
                initial={{
                  opacity: 0,
                  y: 16,
                  scale: 0.7,
                }}
                animate={{
                  opacity: [
                    0,
                    1,
                    1,
                    0,
                  ],
                  y: [
                    16,
                    -5,
                    -8,
                    -26,
                  ],
                  scale: [
                    0.7,
                    1.08,
                    1,
                    0.88,
                  ],
                }}
                transition={{
                  duration: 1.5,
                  times: [
                    0,
                    0.18,
                    0.7,
                    1,
                  ],
                }}
                className={[
                  "leaderboard-row__score-delta",
                  scoreDelta > 0
                    ? "leaderboard-row__score-delta--positive"
                    : "leaderboard-row__score-delta--negative",
                ].join(" ")}
              >
                {scoreDelta > 0
                  ? "+"
                  : ""}
                {scoreDelta}
              </motion.span>
            )}
          </AnimatePresence>

          <div
            className="leaderboard-row__score-arrows"
            aria-hidden="true"
          >
            »»
          </div>
        </section>
      </div>
    </motion.li>
  );
}

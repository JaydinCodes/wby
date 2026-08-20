import {
  AnimatePresence,
  LayoutGroup,
  motion,
} from "motion/react";
import {
  useEffect,
  useRef,
  useState,
} from "react";

import type { Team } from "../types/team";
import { LeaderboardRow } from "./LeaderboardRow";

interface LeaderboardProps {
  teams: Team[];
}

interface LeaderEvent {
  id: string;
  name: string;
  logo: string;
  accent: string;
  accentGlow: string;
}

export function Leaderboard({
  teams,
}: LeaderboardProps) {
  const rankedTeams = [...teams].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    return a.name.localeCompare(b.name);
  });

  const leader = rankedTeams[0];

  const previousLeaderId =
    useRef<string | null>(null);

  const [leaderEvent, setLeaderEvent] =
    useState<LeaderEvent | null>(null);

  useEffect(() => {
    if (!leader) {
      return;
    }

    // Don't trigger takeover on initial render.
    if (previousLeaderId.current === null) {
      previousLeaderId.current = leader.id;
      return;
    }

    if (previousLeaderId.current === leader.id) {
      return;
    }

    previousLeaderId.current = leader.id;

    setLeaderEvent({
      id: leader.id,
      name: leader.name,
      logo: leader.logo,
      accent: leader.accent,
      accentGlow: leader.accentGlow,
    });

    const timeout = window.setTimeout(() => {
      setLeaderEvent(null);
    }, 1900);

    return () => {
      window.clearTimeout(timeout);
    };
  // Depend on the specific leader fields used by the effect, rather than the
  // newly sorted team object created during every render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    leader?.id,
    leader?.name,
    leader?.logo,
    leader?.accent,
    leader?.accentGlow,
  ]);

  return (
    <>
      <LayoutGroup id="live-leaderboard">
        <ol className=" grid
    min-h-[430px]
    grid-rows-4
    gap-[clamp(8px,1.15vh,12px)]
    lg:min-h-[470px]
    xl:min-h-[500px]">
          {rankedTeams.map((team, index) => (
            <LeaderboardRow
              key={team.id}
              team={team}
              rank={index + 1}
              isPriority={index === 0}
            />
          ))}
        </ol>
      </LayoutGroup>

      <AnimatePresence>
        {leaderEvent && (
          <LeaderTakeover
            key={`${leaderEvent.id}-takeover`}
            leader={leaderEvent}
          />
        )}
      </AnimatePresence>
    </>
  );
}

interface LeaderTakeoverProps {
  leader: LeaderEvent;
}

function LeaderTakeover({
  leader,
}: LeaderTakeoverProps) {
  const style = {
    "--takeover-accent": leader.accent,
    "--takeover-glow": leader.accentGlow,
  } as React.CSSProperties;

  return (
    <motion.div
      style={style}
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
        duration: 0.16,
      }}
      className="leader-takeover"
    >
      {/* screen flash */}
      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: [
            0,
            0.95,
            0.15,
            0.5,
            0,
          ],
        }}
        transition={{
          duration: 0.7,
          times: [
            0,
            0.08,
            0.2,
            0.32,
            1,
          ],
        }}
        className="leader-takeover__flash"
      />

      {/* diagonal slash */}
      <motion.div
        initial={{
          x: "-130%",
        }}
        animate={{
          x: "160%",
        }}
        transition={{
          duration: 0.72,
          ease: [0.2, 0.85, 0.3, 1],
        }}
        className="leader-takeover__slash"
      />

      {/* second slash */}
      <motion.div
        initial={{
          x: "130%",
        }}
        animate={{
          x: "-160%",
        }}
        transition={{
          duration: 0.85,
          delay: 0.08,
          ease: [0.2, 0.85, 0.3, 1],
        }}
        className="leader-takeover__slash leader-takeover__slash--secondary"
      />

      {/* scanlines */}
      <div
        className="leader-takeover__scanlines"
        aria-hidden="true"
      />

      {/* paint */}
      <motion.div
        initial={{
          scaleX: 0,
          opacity: 0,
        }}
        animate={{
          scaleX: [
            0,
            1.1,
            1,
          ],
          opacity: [
            0,
            1,
            1,
          ],
        }}
        transition={{
          duration: 0.38,
          delay: 0.18,
        }}
        className="leader-takeover__paint"
      />

      {/* main content */}
      <motion.div
        initial={{
          opacity: 0,
          scale: 1.25,
          rotate: -3,
        }}
        animate={{
          opacity: [
            0,
            1,
            1,
            0,
          ],
          scale: [
            1.25,
            1,
            1,
            0.94,
          ],
          rotate: [
            -3,
            -1,
            -1,
            0,
          ],
        }}
        transition={{
          duration: 1.72,
          delay: 0.16,
          times: [
            0,
            0.14,
            0.76,
            1,
          ],
        }}
        className="leader-takeover__content"
      >
        <motion.div
          initial={{
            opacity: 0,
            y: -18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.3,
          }}
          className="leader-takeover__eyebrow"
        >
          Standings Update
        </motion.div>

        <div className="leader-takeover__headline">
          New Leader
        </div>

        <motion.img
          src={leader.logo}
          alt=""
          initial={{
            opacity: 0,
            scale: 1.8,
            rotate: 8,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            rotate: 0,
          }}
          transition={{
            delay: 0.23,
            type: "spring",
            stiffness: 380,
            damping: 19,
          }}
          className="leader-takeover__logo"
        />

        <div
          className="leader-takeover__team"
          data-text={leader.name}
        >
          {leader.name}
        </div>

        <div className="leader-takeover__number">
          #1
        </div>

        <div
          className="leader-takeover__bars"
          aria-hidden="true"
        >
          <span />
          <span />
          <span />
        </div>
      </motion.div>

      {/* glitch blocks */}
      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: [
            0,
            0.8,
            0,
            0.6,
            0,
          ],
        }}
        transition={{
          duration: 0.8,
          delay: 0.18,
        }}
        className="leader-takeover__glitch leader-takeover__glitch--one"
      />

      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: [
            0,
            0.7,
            0,
            0.5,
            0,
          ],
        }}
        transition={{
          duration: 0.9,
          delay: 0.25,
        }}
        className="leader-takeover__glitch leader-takeover__glitch--two"
      />
    </motion.div>
  );
}

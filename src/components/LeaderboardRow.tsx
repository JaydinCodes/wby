import { motion } from "motion/react";
import type { Team } from "../types/team";

interface LeaderboardRowProps {
  team: Team;
  rank: number;
}

export function LeaderboardRow({
  team,
  rank,
}: LeaderboardRowProps) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.35,
        delay: rank * 0.06,
      }}
      className="
        grid grid-cols-[2.25rem_minmax(0,1fr)_3.5rem]
        items-center gap-2 border-b border-white/10
        px-1 py-3 last:border-b-0
        sm:grid-cols-[4rem_minmax(0,1fr)_5rem]
        sm:gap-4 sm:px-3 sm:py-4
        lg:grid-cols-[5rem_minmax(0,1fr)_7rem]
        lg:py-5
      "
    >
      <div
        className="
          grid size-8 place-items-center rounded-full
          border border-cyan-400 bg-cyan-400/10
          text-sm font-black
          shadow-[0_0_14px_rgba(0,183,255,0.45)]
          sm:size-11 sm:text-lg
          lg:size-12 lg:text-xl
        "
      >
        {rank}
      </div>

      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        <img
          src={team.logo}
          alt={`${team.name} logo`}
          className="size-11 shrink-0 object-contain sm:size-16 lg:size-20"
        />

        <span
          title={team.name}
          className="
            min-w-0 truncate text-[0.78rem] font-black
            uppercase leading-tight tracking-wide
            min-[380px]:text-sm
            sm:text-xl
            lg:text-3xl
          "
        >
          {team.name}
        </span>
      </div>

      <motion.span
        key={team.score}
        initial={{
          scale: 1.25,
          color: "#ff3eb5",
        }}
        animate={{
          scale: 1,
          color: "#ffffff",
        }}
        className="
          text-right text-xl font-black tabular-nums
          min-[380px]:text-2xl
          sm:text-3xl
          lg:text-5xl
        "
      >
        {team.score}
      </motion.span>
    </motion.li>
  );
}
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
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.35,
        delay: rank * 0.08,
      }}
      className="grid grid-cols-[70px_1fr_auto] items-center gap-4 border-b border-white/10 px-3 py-5 last:border-b-0 md:grid-cols-[90px_1fr_auto]"
    >
      <div className="flex size-12 items-center justify-center rounded-full border border-cyan-400 bg-cyan-400/10 text-xl font-black shadow-[0_0_18px_rgba(0,183,255,0.55)]">
        {rank}
      </div>

      <div className="flex min-w-0 items-center gap-4">
        <img
          src={team.logo}
          alt=""
          className="size-16 shrink-0 object-contain md:size-20"
        />

        <span className="truncate text-lg font-black uppercase tracking-wide md:text-3xl">
          {team.name}
        </span>
      </div>

      <motion.span
        key={team.score}
        initial={{ scale: 1.3, color: "#ff3eb5" }}
        animate={{ scale: 1, color: "#ffffff" }}
        className="text-3xl font-black tabular-nums md:text-5xl"
      >
        {team.score}
      </motion.span>
    </motion.li>
  );
}
import { Trophy } from "lucide-react";
import type { Team } from "../types/team";
import { AnimatedBorder } from "./AnimatedBorder";
import { LeaderboardRow } from "./LeaderboardRow";

interface LeaderboardProps {
  teams: Team[];
}

export function Leaderboard({ teams }: LeaderboardProps) {
  const rankedTeams = [...teams].sort((first, second) => {
    if (second.score !== first.score) {
      return second.score - first.score;
    }

    return first.name.localeCompare(second.name);
  });

  return (
    <AnimatedBorder className="w-full rounded-[18px] sm:rounded-[24px]">
      <section className="overflow-hidden p-3 sm:p-5 lg:p-8">
        <header className="mb-3 flex items-center gap-3 sm:mb-6 sm:gap-4">
          <div className="grid size-10 shrink-0 place-items-center rounded-full border border-cyan-400 shadow-[0_0_18px_rgba(0,183,255,0.45)] sm:size-12">
            <Trophy className="size-5 text-cyan-300 sm:size-6" />
          </div>

          <h2 className="text-lg font-black uppercase tracking-wide sm:text-2xl lg:text-3xl">
            Leaderboard
          </h2>
        </header>

        <div className="grid grid-cols-[2.25rem_minmax(0,1fr)_3.5rem] gap-2 border-b border-white/20 px-1 pb-2 text-[0.65rem] font-semibold uppercase tracking-wider text-white/50 sm:grid-cols-[4rem_minmax(0,1fr)_5rem] sm:gap-4 sm:px-3 sm:pb-3 sm:text-sm lg:grid-cols-[5rem_minmax(0,1fr)_7rem]">
          <span>Rank</span>
          <span>Team</span>
          <span className="text-right">Points</span>
        </div>

        <ol>
          {rankedTeams.map((team, index) => (
            <LeaderboardRow
              key={team.id}
              team={team}
              rank={index + 1}
            />
          ))}
        </ol>
      </section>
    </AnimatedBorder>
  );
}
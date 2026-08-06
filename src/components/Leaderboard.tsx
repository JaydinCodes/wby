import { Trophy } from "lucide-react";
import type { Team } from "../types/team";
import { AnimatedBorder } from "./AnimatedBorder";
import { LeaderboardRow } from "./LeaderboardRow";

interface LeaderboardProps {
  teams: Team[];
}

export function Leaderboard({
  teams,
}: LeaderboardProps) {
  const rankedTeams = [...teams].sort(
    (first, second) => second.score - first.score,
  );

  return (
    <AnimatedBorder className="w-full">
      <section className="p-5 md:p-8">
        <header className="mb-6 flex items-center gap-4">
          <div className="rounded-full border border-cyan-400 p-3 shadow-[0_0_20px_rgba(0,183,255,0.45)]">
            <Trophy className="size-6 text-cyan-300" />
          </div>

          <h2 className="text-2xl font-black uppercase md:text-3xl">
            Leaderboard
          </h2>
        </header>

        <div className="grid grid-cols-[70px_1fr_auto] gap-4 border-b border-white/20 px-3 pb-3 text-sm text-white/65 md:grid-cols-[90px_1fr_auto]">
          <span>Rank</span>
          <span>Team</span>
          <span>Points</span>
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
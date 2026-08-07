// src/pages/AdminPage.tsx

import { useEffect, useMemo, useState } from "react";
import {
  Minus,
  Plus,
  RotateCcw,
  Save,
} from "lucide-react";
import type { Team } from "../types/team";
import { AnimatedBorder } from "../components/AnimatedBorder";

interface AdminPageProps {
  teams: Team[];
  onTeamsChange: (teams: Team[]) => void;
}

const quickAdjustments = [-5, -1, 1, 3, 5, 10];

export function AdminPage({
  teams,
  onTeamsChange,
}: AdminPageProps) {
  const [selectedTeamId, setSelectedTeamId] = useState(
    teams[0]?.id ?? "",
  );
  const [exactScore, setExactScore] = useState("");
  const [message, setMessage] = useState("");

  const selectedTeam = useMemo(
    () => teams.find((team) => team.id === selectedTeamId),
    [selectedTeamId, teams],
  );

  useEffect(() => {
    if (!selectedTeam && teams.length > 0) {
      setSelectedTeamId(teams[0].id);
    }
  }, [selectedTeam, teams]);

  useEffect(() => {
    if (selectedTeam) {
      setExactScore(String(selectedTeam.score));
    }
  }, [selectedTeam]);

  function showMessage(text: string) {
    setMessage(text);

    window.setTimeout(() => {
      setMessage("");
    }, 1800);
  }

  function saveScore(score: number) {
    if (!selectedTeam) {
      return;
    }

    if (!Number.isFinite(score)) {
      return;
    }

    const normalizedScore = Math.max(
      0,
      Math.floor(score),
    );

    onTeamsChange(
      teams.map((team) =>
        team.id === selectedTeam.id
          ? {
              ...team,
              score: normalizedScore,
            }
          : team,
      ),
    );

    setExactScore(String(normalizedScore));
    showMessage(`${selectedTeam.name} updated`);
  }

  function changeScore(amount: number) {
    if (!selectedTeam) {
      return;
    }

    saveScore(selectedTeam.score + amount);
  }

  function handleExactScoreSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const parsedScore = Number(exactScore);

    if (
      !Number.isInteger(parsedScore) ||
      parsedScore < 0
    ) {
      showMessage("Enter a valid score");
      return;
    }

    saveScore(parsedScore);
  }

  function handleReset() {
    const confirmed = window.confirm(
      "Reset all team scores to zero?",
    );

    if (!confirmed) {
      return;
    }

    onTeamsChange(
      teams.map((team) => ({
        ...team,
        score: 0,
      })),
    );

    setExactScore("0");
    showMessage("All scores reset");
  }

  function openDisplay() {
    window.open("/", "_blank", "noopener,noreferrer");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#02040c] px-4 py-6 text-white md:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-48 top-0 size-[550px] rounded-full bg-blue-600/20 blur-[150px]" />
        <div className="absolute -right-48 bottom-0 size-[600px] rounded-full bg-pink-600/20 blur-[160px]" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col justify-between gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-5">
            <img
              src="/images/wby-logo.png"
              alt="Westridge Baptist Youth"
              className="h-16 w-auto object-contain md:h-20"
            />

            <div>
              <h1 className="text-2xl font-black md:text-4xl">
                Score Control
              </h1>

              <p className="mt-1 text-cyan-300">
                Private local admin dashboard
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openDisplay}
            className="rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-5 py-3 font-bold text-cyan-300 transition hover:bg-cyan-500/20"
          >
            Open youth display
          </button>
        </header>

        <AnimatedBorder>
          <section className="space-y-8 p-5 md:p-8">
            <div>
              <label
                htmlFor="team"
                className="mb-2 block text-sm font-bold uppercase tracking-wide text-white/65"
              >
                Select team
              </label>

              <select
                id="team"
                value={selectedTeamId}
                onChange={(event) =>
                  setSelectedTeamId(event.target.value)
                }
                className="w-full rounded-xl border border-white/15 bg-[#080d1d] px-4 py-4 text-lg font-bold text-white outline-none transition focus:border-cyan-400"
              >
                {teams.map((team) => (
                  <option
                    key={team.id}
                    value={team.id}
                  >
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedTeam && (
              <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-white/10 bg-white/5 p-5 md:flex-row">
                <div className="flex items-center gap-5">
                  <img
                    src={selectedTeam.logo}
                    alt={`${selectedTeam.name} logo`}
                    className="size-24 object-contain"
                  />

                  <div>
                    <p className="text-sm uppercase tracking-widest text-white/50">
                      Current score
                    </p>

                    <h2 className="text-2xl font-black uppercase md:text-3xl">
                      {selectedTeam.name}
                    </h2>
                  </div>
                </div>

                <span className="text-6xl font-black tabular-nums">
                  {selectedTeam.score}
                </span>
              </div>
            )}

            <div>
              <h3 className="mb-4 text-lg font-black uppercase">
                Quick adjustment
              </h3>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                {quickAdjustments.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => changeScore(amount)}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-4 text-lg font-black transition hover:brightness-110 active:scale-95 ${
                      amount < 0
                        ? "border-pink-400/50 bg-pink-500/10 text-pink-300 hover:bg-pink-500/20"
                        : "border-cyan-400/50 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"
                    }`}
                  >
                    {amount < 0 ? (
                      <Minus className="size-5" />
                    ) : (
                      <Plus className="size-5" />
                    )}

                    {Math.abs(amount)}
                  </button>
                ))}
              </div>
            </div>

            <form
              onSubmit={handleExactScoreSubmit}
              className="space-y-3"
            >
              <label
                htmlFor="exact-score"
                className="block text-sm font-bold uppercase tracking-wide text-white/65"
              >
                Set exact score
              </label>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="exact-score"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={exactScore}
                  onChange={(event) =>
                    setExactScore(event.target.value)
                  }
                  className="min-w-0 flex-1 rounded-xl border border-white/15 bg-[#080d1d] px-4 py-3 text-lg font-bold text-white outline-none transition focus:border-cyan-400"
                />

                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-pink-500 px-6 py-3 font-black uppercase tracking-wide transition hover:brightness-110 active:scale-95"
                >
                  <Save className="size-5" />
                  Save
                </button>
              </div>
            </form>

            {message && (
              <p
                role="status"
                className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-cyan-200"
              >
                {message}
              </p>
            )}

            <button
              type="button"
              onClick={handleReset}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-pink-400/40 bg-pink-500/10 px-5 py-4 font-black uppercase tracking-wide text-pink-300 transition hover:bg-pink-500/20 active:scale-[0.99]"
            >
              <RotateCcw className="size-5" />
              Reset all scores
            </button>
          </section>
        </AnimatedBorder>

        <p className="mt-6 text-center text-sm text-white/40">
          Keep this page open in a separate tab on the same
          browser as the youth display.
        </p>
      </div>
    </main>
  );
}
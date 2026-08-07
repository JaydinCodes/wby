import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  KeyRound,
  LoaderCircle,
  LogOut,
  Minus,
  Plus,
  RotateCcw,
  Save,
  Wifi,
  WifiOff,
} from "lucide-react";
import type { Team } from "../types/team";
import {
  verifyAdminKey,
  type ScoreMutation,
  type SyncStatus,
} from "../lib/scoreApi";
import { AnimatedBorder } from "../components/AnimatedBorder";

interface AdminPageProps {
  teams: Team[];
  onScoreMutation: (
    mutation: ScoreMutation,
    adminKey: string | null,
  ) => Promise<void>;
  syncStatus: SyncStatus;
  lastSyncedAt: number | null;
}

const quickAdjustments = [-5, -1, 1, 3, 5, 10];
const ADMIN_KEY_STORAGE = "wby-score-admin-key";

type AccessMode =
  | "checking"
  | "locked"
  | "live"
  | "local";

export function AdminPage({
  teams,
  onScoreMutation,
  syncStatus,
  lastSyncedAt,
}: AdminPageProps) {
  const [selectedTeamId, setSelectedTeamId] = useState(
    teams[0]?.id ?? "",
  );
  const [exactScore, setExactScore] = useState("");
  const [message, setMessage] = useState("");
  const [pendingCount, setPendingCount] = useState(0);
  const [adminKey, setAdminKey] = useState("");
  const [draftKey, setDraftKey] = useState("");
  const [accessMode, setAccessMode] =
    useState<AccessMode>("checking");
  const [accessError, setAccessError] = useState("");

  const selectedTeam = useMemo(
    () => teams.find((team) => team.id === selectedTeamId),
    [selectedTeamId, teams],
  );

  useEffect(() => {
    const storedKey = sessionStorage.getItem(
      ADMIN_KEY_STORAGE,
    );

    if (!storedKey) {
      setAccessMode("locked");
      return;
    }

    setDraftKey(storedKey);

    void verifyAdminKey(storedKey)
      .then(() => {
        setAdminKey(storedKey);
        setAccessMode("live");
      })
      .catch(() => {
        sessionStorage.removeItem(ADMIN_KEY_STORAGE);
        setAccessMode("locked");
      });
  }, []);

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
    }, 2200);
  }

  async function handleUnlock(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const key = draftKey.trim();

    if (!key) {
      setAccessError("Enter the admin access key.");
      return;
    }

    setAccessError("");
    setAccessMode("checking");

    try {
      await verifyAdminKey(key);
      sessionStorage.setItem(ADMIN_KEY_STORAGE, key);
      setAdminKey(key);
      setAccessMode("live");
    } catch (error) {
      setAccessMode("locked");
      setAccessError(
        error instanceof Error
          ? error.message
          : "Unable to verify the admin key.",
      );
    }
  }

  function useLocalMode() {
    setAdminKey("");
    setAccessError("");
    setAccessMode("local");
  }

  function lockAdmin() {
    sessionStorage.removeItem(ADMIN_KEY_STORAGE);
    setAdminKey("");
    setDraftKey("");
    setAccessMode("locked");
  }

  async function runMutation(
    mutation: ScoreMutation,
    successMessage: string,
  ) {
    setPendingCount((count) => count + 1);

    try {
      await onScoreMutation(
        mutation,
        accessMode === "live" ? adminKey : null,
      );
      showMessage(
        accessMode === "live"
          ? successMessage
          : `${successMessage} — local only`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to update the shared scoreboard.";

      showMessage(errorMessage);

      if (errorMessage.includes("Invalid admin access key")) {
        lockAdmin();
      }
    } finally {
      setPendingCount((count) => Math.max(0, count - 1));
    }
  }

  function changeScore(amount: number) {
    if (!selectedTeam) {
      return;
    }

    void runMutation(
      {
        type: "adjust",
        teamId: selectedTeam.id,
        amount,
      },
      `${selectedTeam.name} ${amount > 0 ? "+" : ""}${amount}`,
    );
  }

  function handleExactScoreSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedTeam) {
      return;
    }

    const parsedScore = Number(exactScore);

    if (
      !Number.isInteger(parsedScore) ||
      parsedScore < 0
    ) {
      showMessage("Enter a valid score");
      return;
    }

    void runMutation(
      {
        type: "set",
        teamId: selectedTeam.id,
        score: parsedScore,
      },
      `${selectedTeam.name} set to ${parsedScore}`,
    );
  }

  function handleReset() {
    const confirmed = window.confirm(
      "Reset all team scores to zero?",
    );

    if (!confirmed) {
      return;
    }

    void runMutation(
      { type: "reset" },
      "All scores reset",
    );
  }

  function openDisplay() {
    window.open("/", "_blank", "noopener,noreferrer");
  }

  if (accessMode === "checking") {
    return (
      <main className="grid min-h-screen place-items-center bg-[#02040c] px-5 text-white">
        <div className="text-center">
          <LoaderCircle className="mx-auto mb-4 size-10 animate-spin text-cyan-300" />
          <p className="font-black uppercase tracking-[0.2em]">
            Connecting to live scores
          </p>
        </div>
      </main>
    );
  }

  if (accessMode === "locked") {
    return (
      <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#02040c] px-4 py-8 text-white">
        <div className="pointer-events-none absolute -left-48 top-0 size-[550px] rounded-full bg-blue-600/20 blur-[150px]" />
        <div className="pointer-events-none absolute -right-48 bottom-0 size-[600px] rounded-full bg-pink-600/20 blur-[160px]" />

        <div className="relative w-full max-w-md">
          <AnimatedBorder>
            <form
              onSubmit={handleUnlock}
              className="space-y-6 p-6 sm:p-8"
            >
              <div className="text-center">
                <KeyRound className="mx-auto mb-4 size-10 text-cyan-300" />
                <h1 className="text-2xl font-black uppercase sm:text-3xl">
                  Score Control
                </h1>
                <p className="mt-2 text-sm text-white/55">
                  Enter the private admin key to control the shared scoreboard from any device.
                </p>
              </div>

              <div>
                <label
                  htmlFor="admin-key"
                  className="mb-2 block text-sm font-bold uppercase tracking-wide text-white/65"
                >
                  Admin access key
                </label>
                <input
                  id="admin-key"
                  type="password"
                  autoComplete="current-password"
                  value={draftKey}
                  onChange={(event) =>
                    setDraftKey(event.target.value)
                  }
                  className="w-full rounded-xl border border-white/15 bg-[#080d1d] px-4 py-3 text-lg text-white outline-none transition focus:border-cyan-400"
                />
              </div>

              {accessError && (
                <p className="rounded-xl border border-pink-400/30 bg-pink-500/10 px-4 py-3 text-sm text-pink-200">
                  {accessError}
                </p>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-pink-500 px-5 py-4 font-black uppercase tracking-wide transition hover:brightness-110 active:scale-[0.99]"
              >
                Unlock live control
              </button>

              <button
                type="button"
                onClick={useLocalMode}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white/65 transition hover:bg-white/10 hover:text-white"
              >
                Use local-only mode
              </button>
            </form>
          </AnimatedBorder>
        </div>
      </main>
    );
  }

  const isLive = accessMode === "live";
  const statusIsHealthy = isLive && syncStatus === "live";

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

              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm font-bold">
                <span
                  className={`flex items-center gap-2 ${
                    statusIsHealthy
                      ? "text-cyan-300"
                      : "text-pink-300"
                  }`}
                >
                  {statusIsHealthy ? (
                    <Wifi className="size-4" />
                  ) : (
                    <WifiOff className="size-4" />
                  )}
                  {isLive
                    ? syncStatus === "live"
                      ? "LIVE SHARED"
                      : "RECONNECTING"
                    : "LOCAL ONLY"}
                </span>

                {lastSyncedAt && isLive && (
                  <span className="text-white/35">
                    synced {new Date(lastSyncedAt).toLocaleTimeString()}
                  </span>
                )}

                {pendingCount > 0 && (
                  <span className="text-white/55">
                    syncing {pendingCount}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={openDisplay}
              className="rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-5 py-3 font-bold text-cyan-300 transition hover:bg-cyan-500/20"
            >
              Open youth display
            </button>

            {isLive && (
              <button
                type="button"
                onClick={lockAdmin}
                className="grid size-12 place-items-center rounded-xl border border-white/15 bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white"
                aria-label="Lock admin controls"
                title="Lock admin controls"
              >
                <LogOut className="size-5" />
              </button>
            )}
          </div>
        </header>

        {!isLive && (
          <p className="mb-5 rounded-xl border border-pink-400/30 bg-pink-500/10 px-4 py-3 text-sm font-semibold text-pink-200">
            Local-only mode updates tabs on this browser only. Unlock live control before running the event remotely.
          </p>
        )}

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
                  <option key={team.id} value={team.id}>
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
      </div>
    </main>
  );
}

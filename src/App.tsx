import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { AdminPage } from "./pages/AdminPage";
import { DisplayPage } from "./pages/DisplayPage";
import { initialTeams } from "./data/teams";
import {
  fetchScores,
  mutateScores,
  type ScoreMutation,
  type SyncStatus,
} from "./lib/scoreApi";
import type { Team } from "./types/team";

const STORAGE_KEY = "wby-leaderboard-teams-v2";
const ADMIN_PATH = "/wby-score-console-a84m2p";
const ACTIVE_SCORE_POLL_INTERVAL_MS = 1000;
const BACKGROUND_SCORE_POLL_INTERVAL_MS = 15000;


interface StoredTeam {
  id: string;
  score: number;
}

function isStoredTeam(value: unknown): value is StoredTeam {
  if (!value || typeof value !== "object") {
    return false;
  }

  const team = value as Partial<StoredTeam>;

  return (
    typeof team.id === "string" &&
    typeof team.score === "number" &&
    Number.isFinite(team.score)
  );
}

function hydrateTeams(value: unknown): Team[] {
  if (!Array.isArray(value)) {
    return initialTeams;
  }

  const storedScores = new Map<string, number>();

  for (const team of value) {
    if (!isStoredTeam(team)) {
      continue;
    }

    storedScores.set(team.id, team.score);
  }

  return initialTeams.map((team) => ({
    ...team,
    score: storedScores.get(team.id) ?? team.score,
  }));
}

function loadTeams(): Team[] {
  try {
    const storedTeams = localStorage.getItem(STORAGE_KEY);

    if (!storedTeams) {
      return initialTeams;
    }

    return hydrateTeams(JSON.parse(storedTeams));
  } catch {
    return initialTeams;
  }
}

function mergeScores(
  teams: Team[],
  scores: Record<string, number>,
): Team[] {
  let changed = false;

  const nextTeams = teams.map((team) => {
    const score = scores[team.id];

    if (
      !Number.isInteger(score) ||
      score < 0 ||
      score === team.score
    ) {
      return team;
    }

    changed = true;

    return {
      ...team,
      score,
    };
  });

  return changed ? nextTeams : teams;
}

function applyMutationLocally(
  teams: Team[],
  mutation: ScoreMutation,
): Team[] {
  if (mutation.type === "reset") {
    return teams.map((team) =>
      team.score === 0
        ? team
        : {
            ...team,
            score: 0,
          },
    );
  }

  return teams.map((team) => {
    if (team.id !== mutation.teamId) {
      return team;
    }

    const score =
      mutation.type === "adjust"
        ? Math.max(0, team.score + mutation.amount)
        : mutation.score;

    return score === team.score
      ? team
      : {
          ...team,
          score,
        };
  });
}

export default function App() {
  const [teams, setTeams] = useState<Team[]>(loadTeams);
  const [syncStatus, setSyncStatus] =
    useState<SyncStatus>("connecting");
  const [lastSyncedAt, setLastSyncedAt] = useState<
    number | null
  >(null);

  const isFetchingRef = useRef(false);
  const pendingMutationsRef = useRef(0);
  const mutationRevisionRef = useRef(0);
  const mutationQueueRef = useRef<Promise<void>>(
    Promise.resolve(),
  );

  const isAdminRoute =
    window.location.pathname === ADMIN_PATH;

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(teams),
    );
  }, [teams]);

  useEffect(() => {
  function handleStorage(event: StorageEvent) {
    if (
      event.key !== STORAGE_KEY ||
      !event.newValue
    ) {
      return;
    }

    try {
      const parsed: unknown = JSON.parse(
        event.newValue,
      );

      setTeams(hydrateTeams(parsed));
    } catch (error) {
      console.error(
        "Unable to synchronize local leaderboard:",
        error,
      );
    }
  }

  window.addEventListener(
    "storage",
    handleStorage,
  );

  return () => {
    window.removeEventListener(
      "storage",
      handleStorage,
    );
  };
}, []);

  const refreshScores = useCallback(async () => {
    if (
      isFetchingRef.current ||
      pendingMutationsRef.current > 0
    ) {
      return;
    }

    isFetchingRef.current = true;

    try {
      const response = await fetchScores();

      setTeams((currentTeams) =>
        mergeScores(currentTeams, response.scores),
      );
      setSyncStatus("live");

      // The public display does not render sync timestamps. Avoid forcing
      // an otherwise unnecessary React render every second there.
      if (isAdminRoute) {
        setLastSyncedAt(Date.now());
      }
    } catch (error) {
      console.error("Remote score sync unavailable:", error);
      setSyncStatus("offline");
    } finally {
      isFetchingRef.current = false;
    }
  }, [isAdminRoute]);

  useEffect(() => {
    let intervalId: number | null = null;

    function startPolling() {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }

      void refreshScores();

      const interval =
        document.visibilityState === "visible"
          ? ACTIVE_SCORE_POLL_INTERVAL_MS
          : BACKGROUND_SCORE_POLL_INTERVAL_MS;

      intervalId = window.setInterval(
        () => void refreshScores(),
        interval,
      );
    }

    function handleVisibilityChange() {
      startPolling();
    }

    startPolling();
    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    return () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
    };
  }, [refreshScores]);

  const handleScoreMutation = useCallback(
    (
      mutation: ScoreMutation,
      adminKey: string | null,
    ): Promise<void> => {
      const revision = ++mutationRevisionRef.current;

      setTeams((currentTeams) =>
        applyMutationLocally(currentTeams, mutation),
      );

      if (!adminKey) {
        setSyncStatus("offline");
        return Promise.resolve();
      }

      pendingMutationsRef.current += 1;

      const runMutation = mutationQueueRef.current
        .catch(() => undefined)
        .then(async () => {
          const response = await mutateScores(
            mutation,
            adminKey,
          );

          if (revision === mutationRevisionRef.current) {
            setTeams((currentTeams) =>
              mergeScores(currentTeams, response.scores),
            );
          }

          setSyncStatus("live");
          setLastSyncedAt(Date.now());
        })
        .catch((error: unknown) => {
          setSyncStatus("offline");
          throw error;
        })
        .finally(() => {
          pendingMutationsRef.current = Math.max(
            0,
            pendingMutationsRef.current - 1,
          );
        });

      mutationQueueRef.current = runMutation.then(
        () => undefined,
        () => undefined,
      );

      return runMutation;
    },
    [],
  );

  return isAdminRoute ? (
    <AdminPage
      teams={teams}
      onScoreMutation={handleScoreMutation}
      syncStatus={syncStatus}
      lastSyncedAt={lastSyncedAt}
    />
  ) : (
    <DisplayPage teams={teams} />
  );
}

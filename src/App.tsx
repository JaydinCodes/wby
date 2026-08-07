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

const STORAGE_KEY = "wby-leaderboard-teams";
const ADMIN_PATH = "/wby-score-console-a84m2p";
const SCORE_POLL_INTERVAL_MS = 1000;

function isValidTeam(value: unknown): value is Team {
  if (!value || typeof value !== "object") {
    return false;
  }

  const team = value as Partial<Team>;

  return (
    typeof team.id === "string" &&
    typeof team.name === "string" &&
    typeof team.logo === "string" &&
    typeof team.score === "number" &&
    Number.isFinite(team.score)
  );
}

function loadTeams(): Team[] {
  try {
    const storedTeams = localStorage.getItem(STORAGE_KEY);

    if (!storedTeams) {
      return initialTeams;
    }

    const parsed: unknown = JSON.parse(storedTeams);

    if (
      !Array.isArray(parsed) ||
      !parsed.every(isValidTeam)
    ) {
      return initialTeams;
    }

    return parsed;
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

        if (
          Array.isArray(parsed) &&
          parsed.every(isValidTeam)
        ) {
          setTeams(parsed);
        }
      } catch (error) {
        console.error(
          "Unable to synchronize local leaderboard:",
          error,
        );
      }
    }

    window.addEventListener("storage", handleStorage);

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
      setLastSyncedAt(Date.now());
    } catch (error) {
      console.error("Remote score sync unavailable:", error);
      setSyncStatus("offline");
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    void refreshScores();

    const intervalId = window.setInterval(
      () => void refreshScores(),
      SCORE_POLL_INTERVAL_MS,
    );

    return () => {
      window.clearInterval(intervalId);
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
    <DisplayPage
      teams={teams}
      syncStatus={syncStatus}
    />
  );
}

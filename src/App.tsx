import { useEffect, useState } from "react";
import { AdminPage } from "./pages/AdminPage";
import { DisplayPage } from "./pages/DisplayPage";
import { initialTeams } from "./data/teams";
import type { Team } from "./types/team";

const STORAGE_KEY = "wby-leaderboard-teams";
const ADMIN_PATH = "/wby-score-console-a84m2p";

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

export default function App() {
  const [teams, setTeams] = useState<Team[]>(loadTeams);

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
          "Unable to synchronize leaderboard:",
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

  return isAdminRoute ? (
    <AdminPage
      teams={teams}
      onTeamsChange={setTeams}
    />
  ) : (
    <DisplayPage teams={teams} />
  );
}
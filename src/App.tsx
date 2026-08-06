import { useEffect, useState } from "react";
import { AdminPage } from "./pages/AdminPage";
import { DisplayPage } from "./pages/DisplayPage";
import { initialTeams } from "./data/teams";
import type { Team } from "./types/team";

const STORAGE_KEY = "wby-leaderboard-teams";
const ADMIN_PATH = "/control-7x9k";

function loadTeams(): Team[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return initialTeams;
    }

    const parsed: unknown = JSON.parse(stored);

    return Array.isArray(parsed)
      ? (parsed as Team[])
      : initialTeams;
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
        const nextTeams: unknown = JSON.parse(
          event.newValue,
        );

        if (Array.isArray(nextTeams)) {
          setTeams(nextTeams as Team[]);
        }
      } catch (error) {
        console.error(
          "Unable to synchronize scores:",
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
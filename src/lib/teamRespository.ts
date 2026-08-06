import {
  get,
  onValue,
  ref,
  set,
  update,
  type Unsubscribe,
} from "firebase/database";
import { database } from "./firebase";
import { initialTeams } from "../data/teams";
import type { Team } from "../types/team";

const teamsRef = ref(database, "teams");

function normalizeTeams(value: unknown): Team[] {
  if (!value || typeof value !== "object") {
    return [];
  }

  return Object.values(value).filter((team): team is Team => {
    if (!team || typeof team !== "object") {
      return false;
    }

    const candidate = team as Partial<Team>;

    return (
      typeof candidate.id === "string" &&
      typeof candidate.name === "string" &&
      typeof candidate.score === "number" &&
      typeof candidate.logo === "string"
    );
  });
}

export async function seedTeamsIfEmpty(): Promise<void> {
  const snapshot = await get(teamsRef);

  if (snapshot.exists()) {
    return;
  }

  const teams = Object.fromEntries(
    initialTeams.map((team) => [team.id, team]),
  );

  await set(teamsRef, teams);
}

export function subscribeToTeams(
  onTeamsChanged: (teams: Team[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onValue(
    teamsRef,
    (snapshot) => {
      const teams = normalizeTeams(snapshot.val());

      onTeamsChanged(teams);
    },
    (error) => {
      onError?.(error);
    },
  );
}

export async function updateTeamScore(
  teamId: string,
  score: number,
): Promise<void> {
  if (!Number.isInteger(score) || score < 0) {
    throw new Error("Score must be a non-negative integer.");
  }

  await update(ref(database, `teams/${teamId}`), {
    score,
  });
}

export async function resetAllScores(
  teams: Team[],
): Promise<void> {
  const updates = Object.fromEntries(
    teams.map((team) => [
      `teams/${team.id}/score`,
      0,
    ]),
  );

  await update(ref(database), updates);
}
export type SyncStatus = "connecting" | "live" | "offline";

export type ScoreMutation =
  | {
      type: "adjust";
      teamId: string;
      amount: number;
    }
  | {
      type: "set";
      teamId: string;
      score: number;
    }
  | {
      type: "reset";
    };

export interface ScoreApiResponse {
  scores: Record<string, number>;
  updatedAt: string | null;
}

async function readResponse(
  response: Response,
): Promise<ScoreApiResponse> {
  const payload = (await response.json()) as
    | ScoreApiResponse
    | { error?: string };

  if (!response.ok) {
    throw new Error(
      "error" in payload && payload.error
        ? payload.error
        : "Unable to synchronize scores.",
    );
  }

  if (!("scores" in payload)) {
    throw new Error("Score server returned an invalid response.");
  }

  return payload;
}

export async function fetchScores(
  signal?: AbortSignal,
): Promise<ScoreApiResponse> {
  const response = await fetch("/api/scores", {
    method: "GET",
    cache: "no-store",
    signal,
  });

  return readResponse(response);
}

export async function verifyAdminKey(
  adminKey: string,
): Promise<ScoreApiResponse> {
  const response = await fetch("/api/scores", {
    method: "POST",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${adminKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type: "verify" }),
  });

  return readResponse(response);
}

export async function mutateScores(
  mutation: ScoreMutation,
  adminKey: string,
): Promise<ScoreApiResponse> {
  const response = await fetch("/api/scores", {
    method: "POST",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${adminKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mutation),
  });

  return readResponse(response);
}

import { timingSafeEqual } from "node:crypto";

const SCORE_KEY = "wby:scores:v2";
const TEAM_IDS = new Set([
  "chosen",
  "eagles-wings",
  "pathfinders",
  "striped-warriors",
]);

const DEFAULT_SCORES = {
  chosen: 0,
  "eagles-wings": 0,
  pathfinders: 0,
  "striped-warriors": 0,
};

const ADJUST_SCORE_SCRIPT = `
local current = tonumber(redis.call("HGET", KEYS[1], ARGV[1]) or "0")
local next = current + tonumber(ARGV[2])
if next < 0 then
  next = 0
end
redis.call("HSET", KEYS[1], ARGV[1], next, "__updatedAt", ARGV[3])
return next
`;

function sendJson(response, status, body) {
  response.setHeader("Cache-Control", "no-store, max-age=0");
  response.status(status).json(body);
}

function getRedisConfig() {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ??
    process.env.KV_REST_API_URL;

  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ??
    process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    throw new Error(
      "Shared score storage is not configured. Expected UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN or KV_REST_API_URL/KV_REST_API_TOKEN.",
    );
  }

  return { url, token };
}

async function redis(command) {
  const { url, token } = getRedisConfig();
  const redisResponse = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });

  if (!redisResponse.ok) {
    throw new Error(`Redis request failed with ${redisResponse.status}.`);
  }

  const payload = await redisResponse.json();

  if (payload.error) {
    throw new Error(payload.error);
  }

  return payload.result;
}

function parseHash(result) {
  if (!result) {
    return {};
  }

  if (!Array.isArray(result) && typeof result === "object") {
    return result;
  }

  if (!Array.isArray(result)) {
    return {};
  }

  const hash = {};

  for (let index = 0; index < result.length; index += 2) {
    const field = result[index];
    const value = result[index + 1];

    if (typeof field === "string" && value !== undefined) {
      hash[field] = value;
    }
  }

  return hash;
}

async function readScores() {
  const hash = parseHash(await redis(["HGETALL", SCORE_KEY]));
  const scores = { ...DEFAULT_SCORES };

  for (const teamId of TEAM_IDS) {
    const value = Number(hash[teamId]);

    if (Number.isInteger(value) && value >= 0) {
      scores[teamId] = value;
    }
  }

  return {
    scores,
    updatedAt:
      typeof hash.__updatedAt === "string"
        ? hash.__updatedAt
        : null,
  };
}

function readBearerToken(request) {
  const authorization = request.headers.authorization;

  if (typeof authorization !== "string") {
    return "";
  }

  const [scheme, token] = authorization.split(" ", 2);

  if (scheme !== "Bearer" || !token) {
    return "";
  }

  return token;
}

function normalizeSecret(value) {
  if (typeof value !== "string") {
    return "";
  }

  let normalized = value.trim();

  if (
    normalized.length >= 2 &&
    ((normalized.startsWith('"') && normalized.endsWith('"')) ||
      (normalized.startsWith("'") && normalized.endsWith("'")))
  ) {
    normalized = normalized.slice(1, -1).trim();
  }

  return normalized;
}

function getConfiguredAdminKey() {
  // Prefer the WBY-specific key so a fresh manually-created Vercel variable
  // can override any stale/managed SCORE_ADMIN_KEY value.
  return normalizeSecret(
    process.env.WBY_ADMIN_KEY ?? process.env.SCORE_ADMIN_KEY,
  );
}

function secureEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function isAuthorized(request) {
  const configuredKey = getConfiguredAdminKey();

  if (!configuredKey) {
    return false;
  }

  return secureEqual(
    normalizeSecret(readBearerToken(request)),
    configuredKey,
  );
}

function parseBody(request) {
  if (typeof request.body === "string") {
    return JSON.parse(request.body);
  }

  return request.body ?? {};
}

function isValidTeamId(teamId) {
  return typeof teamId === "string" && TEAM_IDS.has(teamId);
}

export default async function handler(request, response) {
  try {
    if (request.method === "GET") {
      sendJson(response, 200, await readScores());
      return;
    }

    if (request.method !== "POST") {
      response.setHeader("Allow", "GET, POST");
      sendJson(response, 405, { error: "Method not allowed." });
      return;
    }

    if (!getConfiguredAdminKey()) {
      sendJson(response, 503, {
        error: "Admin access key is not configured. Add WBY_ADMIN_KEY in Vercel Production environment variables.",
      });
      return;
    }

    if (!isAuthorized(request)) {
      sendJson(response, 401, {
        error: "Invalid admin access key. This deployment is configured to prefer WBY_ADMIN_KEY over SCORE_ADMIN_KEY.",
      });
      return;
    }

    const body = parseBody(request);

    if (body.type === "verify") {
      sendJson(response, 200, await readScores());
      return;
    }

    const now = new Date().toISOString();

    if (body.type === "adjust") {
      if (
        !isValidTeamId(body.teamId) ||
        !Number.isInteger(body.amount) ||
        Math.abs(body.amount) > 10000
      ) {
        sendJson(response, 400, { error: "Invalid score adjustment." });
        return;
      }

      await redis([
        "EVAL",
        ADJUST_SCORE_SCRIPT,
        1,
        SCORE_KEY,
        body.teamId,
        String(body.amount),
        now,
      ]);
    } else if (body.type === "set") {
      if (
        !isValidTeamId(body.teamId) ||
        !Number.isInteger(body.score) ||
        body.score < 0 ||
        body.score > 1000000
      ) {
        sendJson(response, 400, { error: "Invalid score." });
        return;
      }

      await redis([
        "HSET",
        SCORE_KEY,
        body.teamId,
        String(body.score),
        "__updatedAt",
        now,
      ]);
    } else if (body.type === "reset") {
      await redis([
        "HSET",
        SCORE_KEY,
        "chosen",
        "0",
        "eagles-wings",
        "0",
        "pathfinders",
        "0",
        "striped-warriors",
        "0",
        "__updatedAt",
        now,
      ]);
    } else {
      sendJson(response, 400, { error: "Unknown score operation." });
      return;
    }

    sendJson(response, 200, await readScores());
  } catch (error) {
    console.error("Score API error:", error);
    sendJson(response, 503, {
      error:
        error instanceof Error
          ? error.message
          : "Unable to access shared scores.",
    });
  }
}

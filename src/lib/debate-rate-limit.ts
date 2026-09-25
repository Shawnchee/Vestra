import { createHmac, randomUUID } from "node:crypto";

const PER_IP_WINDOW_MS = 15 * 60 * 1000;
const PER_IP_LIMIT = 5;
const GLOBAL_WINDOW_MS = 24 * 60 * 60 * 1000;
const GLOBAL_LIMIT = 40;

const SLIDING_WINDOW_SCRIPT = `
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local maximum = tonumber(ARGV[3])
local member = ARGV[4]
redis.call("ZREMRANGEBYSCORE", KEYS[1], "-inf", now - window)
local count = redis.call("ZCARD", KEYS[1])
if count >= maximum then
  local oldest = redis.call("ZRANGE", KEYS[1], 0, 0, "WITHSCORES")
  return {0, 0, tonumber(oldest[2]) + window}
end
redis.call("ZADD", KEYS[1], now, member)
redis.call("PEXPIRE", KEYS[1], window)
return {1, maximum - count - 1, now + window}
`;

type WindowResult = { allowed: boolean; retryAfterSeconds: number; remaining: number };
type UpstashResponse = { result?: unknown; error?: unknown };
type LimitStatus =
  | { status: "allowed" }
  | { status: "limited"; retryAfterSeconds: number }
  | { status: "unconfigured" }
  | { status: "unavailable" };

type LocalWindow = { timestamps: number[] };
type RateLimitGlobal = typeof globalThis & { __vestraDebateWindows?: Map<string, LocalWindow> };
const rateLimitGlobal = globalThis as RateLimitGlobal;
const localWindows = rateLimitGlobal.__vestraDebateWindows ??= new Map<string, LocalWindow>();

function trustedClientAddress(request: Request): string | null {
  const headers = request.headers;
  if (headers.has("x-vercel-id")) {
    const ip = headers.get("x-vercel-forwarded-for") ?? headers.get("x-forwarded-for");
    return ip?.split(",")[0]?.trim() || null;
  }
  const cloudflareIp = headers.get("cf-connecting-ip");
  if (headers.has("cf-ray") && cloudflareIp) return cloudflareIp.trim();
  if (process.env.NODE_ENV !== "production") {
    const localIp = headers.get("x-forwarded-for") ?? headers.get("x-real-ip");
    return localIp?.split(",")[0]?.trim() || "local-preview";
  }
  return null;
}

function localWindowLimit(key: string, now: number, windowMs: number, maximum: number): WindowResult {
  const entry = localWindows.get(key) ?? { timestamps: [] };
  entry.timestamps = entry.timestamps.filter((timestamp) => timestamp > now - windowMs);
  if (entry.timestamps.length >= maximum) {
    const retryAfterMs = entry.timestamps[0] + windowMs - now;
    localWindows.set(key, entry);
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)), remaining: 0 };
  }
  entry.timestamps.push(now);
  localWindows.set(key, entry);
  return { allowed: true, retryAfterSeconds: 0, remaining: maximum - entry.timestamps.length };
}

async function upstashWindowLimit(
  url: string,
  token: string,
  key: string,
  now: number,
  windowMs: number,
  maximum: number,
): Promise<WindowResult> {
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(["EVAL", SLIDING_WINDOW_SCRIPT, 1, key, now, windowMs, maximum, randomUUID()]),
    signal: AbortSignal.timeout(2_000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Rate-limit service returned an error");
  const payload = await response.json() as UpstashResponse;
  if (payload.error || !Array.isArray(payload.result) || payload.result.length < 3) {
    throw new Error("Rate-limit service returned an invalid result");
  }
  const [allowed, remaining, resetAt] = payload.result.map(Number);
  if (![allowed, remaining, resetAt].every(Number.isFinite)) throw new Error("Rate-limit service returned invalid values");
  return {
    allowed: allowed === 1,
    remaining,
    retryAfterSeconds: allowed === 1 ? 0 : Math.max(1, Math.ceil((resetAt - now) / 1000)),
  };
}

export async function limitDebateRequest(request: Request): Promise<LimitStatus> {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  const salt = process.env.RATE_LIMIT_HASH_SALT;
  const configuredValues = [url, token, salt].filter(Boolean).length;
  const isProduction = process.env.NODE_ENV === "production";

  if (configuredValues !== 0 && configuredValues !== 3) return { status: "unconfigured" };
  if (!configuredValues && isProduction) return { status: "unconfigured" };

  const address = trustedClientAddress(request);
  if (!address) return { status: "unavailable" };
  const now = Date.now();

  if (!configuredValues) {
    const ipLimit = localWindowLimit(`ip:${address}`, now, PER_IP_WINDOW_MS, PER_IP_LIMIT);
    if (!ipLimit.allowed) return { status: "limited", retryAfterSeconds: ipLimit.retryAfterSeconds };
    const globalLimit = localWindowLimit("global", now, GLOBAL_WINDOW_MS, GLOBAL_LIMIT);
    return globalLimit.allowed
      ? { status: "allowed" }
      : { status: "limited", retryAfterSeconds: globalLimit.retryAfterSeconds };
  }

  try {
    const redisUrl = new URL(url!);
    if (redisUrl.protocol !== "https:" || redisUrl.username || redisUrl.password || salt!.length < 32) {
      return { status: "unconfigured" };
    }
    const hashedAddress = createHmac("sha256", salt!).update(address).digest("hex");
    const ipLimit = await upstashWindowLimit(redisUrl.toString(), token!, `vestra:debate:ip:${hashedAddress}`, now, PER_IP_WINDOW_MS, PER_IP_LIMIT);
    if (!ipLimit.allowed) return { status: "limited", retryAfterSeconds: ipLimit.retryAfterSeconds };
    const globalLimit = await upstashWindowLimit(redisUrl.toString(), token!, "vestra:debate:global", now, GLOBAL_WINDOW_MS, GLOBAL_LIMIT);
    return globalLimit.allowed
      ? { status: "allowed" }
      : { status: "limited", retryAfterSeconds: globalLimit.retryAfterSeconds };
  } catch {
    return { status: "unavailable" };
  }
}

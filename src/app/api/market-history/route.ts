import { NextResponse } from "next/server";
import { getPreStocks } from "@/lib/prestocks";

export const revalidate = 60;

const GECKO = "https://api.geckoterminal.com/api/v2";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const VERSION = "application/json;version=20230203";

type Resource = {
  id?: string;
  attributes?: Record<string, unknown>;
  relationships?: Record<string, { data?: { id?: string } }>;
};

function addressFromId(id: unknown): string {
  return typeof id === "string" ? id.replace(/^solana_/, "") : "";
}

function asNumber(value: unknown): number | null {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

export async function GET(request: Request) {
  const mint = new URL(request.url).searchParams.get("mint")?.trim();
  if (!mint || mint.length < 32 || mint.length > 50) {
    return NextResponse.json({ error: "A valid PreStocks mint is required." }, { status: 400 });
  }

  try {
    const catalogue = await getPreStocks();
    if (catalogue.error) {
      return NextResponse.json({ error: "The PreStocks catalogue is temporarily unavailable. Try again shortly.", provider: "PreStocks" }, { status: 503 });
    }
    if (!catalogue.assets.some((asset) => asset.mint === mint)) {
      return NextResponse.json({ error: "Only mints in the PreStocks catalogue can be used here." }, { status: 404 });
    }

    const headers = { Accept: VERSION };
    const poolsUrl = new URL(`${GECKO}/networks/solana/tokens/${encodeURIComponent(mint)}/pools`);
    poolsUrl.searchParams.set("include", "base_token,quote_token");
    const poolsResponse = await fetch(poolsUrl, { headers, next: { revalidate: 60 }, signal: AbortSignal.timeout(9000) });
    if (!poolsResponse.ok) throw new Error(`pool discovery returned ${poolsResponse.status}`);
    const poolsPayload = await poolsResponse.json() as { data?: Resource[] };
    const pools = Array.isArray(poolsPayload.data) ? poolsPayload.data : [];
    const candidates = pools.flatMap((pool) => {
      const base = addressFromId(pool.relationships?.base_token?.data?.id);
      const quote = addressFromId(pool.relationships?.quote_token?.data?.id);
      const token = base === mint ? "base" : quote === mint ? "quote" : null;
      if (!token || (base !== USDC_MINT && quote !== USDC_MINT)) return [];
      const attrs = pool.attributes ?? {};
      const liquidity = asNumber(attrs.reserve_in_usd);
      const volume = asNumber((attrs.volume_usd as Record<string, unknown> | undefined)?.h24) ?? 0;
      if (!liquidity || volume <= 0) return [];
      const id = typeof pool.id === "string" ? pool.id.split("_").slice(1).join("_") : "";
      return id ? [{ id, token, liquidity, volume, name: typeof attrs.name === "string" ? attrs.name : "PreStocks / USDC" }] : [];
    }).sort((a, b) => b.liquidity - a.liquidity || b.volume - a.volume);

    const selected = candidates[0];
    if (!selected) {
      return NextResponse.json({ error: "No USDC pool with recent trading activity was found for this PreStocks mint.", provider: "GeckoTerminal" }, { status: 404 });
    }

    const candleUrl = new URL(`${GECKO}/networks/solana/pools/${encodeURIComponent(selected.id)}/ohlcv/day`);
    candleUrl.searchParams.set("aggregate", "1");
    candleUrl.searchParams.set("limit", "90");
    candleUrl.searchParams.set("currency", "usd");
    candleUrl.searchParams.set("token", selected.token);
    const candleResponse = await fetch(candleUrl, { headers, next: { revalidate: 60 }, signal: AbortSignal.timeout(9000) });
    if (!candleResponse.ok) throw new Error(`candle request returned ${candleResponse.status}`);
    const candlePayload = await candleResponse.json() as { data?: { attributes?: { ohlcv_list?: unknown } } };
    const rawCandles = candlePayload.data?.attributes?.ohlcv_list;
    const parsedCandles = Array.isArray(rawCandles) ? rawCandles.flatMap((row): { time: number; open: number; high: number; low: number; close: number; volume: number }[] => {
      if (!Array.isArray(row) || row.length < 6) return [];
      const [time, open, high, low, close, volume] = row.map(Number);
      if (![time, open, high, low, close, volume].every(Number.isFinite) || time <= 0 || close <= 0 || open <= 0 || low <= 0 || high < low || volume < 0) return [];
      return [{ time, open, high, low, close, volume }];
    }).sort((a, b) => a.time - b.time) : [];
    // Exclude the current UTC day: its OHLCV candle may still be forming and is
    // not a completed daily close for the chart, headline replay, or backtest.
    const now = new Date();
    const currentUtcDayStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 1000;
    const completedCandles = parsedCandles.filter((candle) => candle.time < currentUtcDayStart);

    // GeckoTerminal can return repeated daily timestamps. Keep the most complete
    // observation (highest reported volume) and never add duplicate volume together.
    const candlesByTime = new Map<number, (typeof parsedCandles)[number]>();
    for (const candle of completedCandles) {
      const existing = candlesByTime.get(candle.time);
      if (!existing || candle.volume > existing.volume) candlesByTime.set(candle.time, candle);
    }
    const candles = [...candlesByTime.values()];

    if (candles.length < 2) {
      return NextResponse.json({ error: "This pool does not have enough daily history to chart yet.", provider: "GeckoTerminal", pool: selected }, { status: 404 });
    }

    return NextResponse.json({
      mint,
      preStocks: { tokenPrice: catalogue.assets.find((asset) => asset.mint === mint)?.tokenPrice ?? null, markPrice: catalogue.assets.find((asset) => asset.mint === mint)?.markPrice ?? null },
      provider: "GeckoTerminal",
      fetchedAt: new Date().toISOString(),
      pool: { address: selected.id, name: selected.name, liquidityUsd: selected.liquidity, volume24hUsd: selected.volume },
      interval: "1 day",
      currency: "USD",
      candles,
    });
  } catch {
    return NextResponse.json({ error: "On-chain price history is temporarily unavailable. Try again shortly.", provider: "GeckoTerminal" }, { status: 502 });
  }
}

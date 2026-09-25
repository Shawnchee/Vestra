"use client";

import { RefreshCw, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { PreStock } from "@/lib/prestocks";
import { analyzeMarketQuality } from "@/lib/market-quality";

type History = { fetchedAt: string; preStocks?: { tokenPrice: number | null; markPrice: number | null }; pool: { liquidityUsd: number; volume24hUsd: number }; candles: { time: number; close: number }[]; error?: string };
type Result = { state: "loading" | "ready" | "error"; label?: string; flags?: string[]; movement?: string; updatedAt?: string };
type MarketSample = { tokenPrice: number | null; sampledAt: number };
const timeLabel = (value?: string) => value ? new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date(value)) : "";

function quoteMovement(symbol: string, tokenPrice: number | null) {
  if (tokenPrice === null || tokenPrice <= 0) return "Quote change unavailable";
  const key = `vestra:market-check:${symbol}`;
  try {
    const previous = window.localStorage.getItem(key);
    window.localStorage.setItem(key, JSON.stringify({ tokenPrice, sampledAt: Date.now() } satisfies MarketSample));
    if (!previous) return "First check · next check shows quote change";
    const sample = JSON.parse(previous) as Partial<MarketSample>;
    if (typeof sample.tokenPrice !== "number" || sample.tokenPrice <= 0) return "First check · next check shows quote change";
    const change = (tokenPrice / sample.tokenPrice - 1) * 100;
    return Math.abs(change) < 0.5 ? "Quote steady · under 0.5% since last check" : `Quote ${change > 0 ? "+" : ""}${change.toFixed(2)}% since last check`;
  } catch {
    return "Quote checked · change history is browser-only";
  }
}

export function WatchlistMonitor({ assets }: { assets: PreStock[] }) {
  const [results, setResults] = useState<Record<string, Result>>({});
  const [refreshing, setRefreshing] = useState(false);
  const monitored = useMemo(() => assets.slice(0, 5), [assets]);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    if (!monitored.length) return;
    setRefreshing(true);
    setResults((previous) => Object.fromEntries(monitored.map((asset) => [asset.symbol, previous[asset.symbol] ?? { state: "loading" as const }])));
    await Promise.all(monitored.map(async (asset) => {
      try {
        const response = await fetch(`/api/market-history?mint=${encodeURIComponent(asset.mint)}`, { signal, cache: "no-store" });
        const history = await response.json() as History;
        if (!response.ok) throw new Error(history.error ?? "Market check unavailable");
        const latest = history.candles.at(-1);
        if (!latest) throw new Error("No completed pool close");
        const quality = analyzeMarketQuality({ tokenPrice: history.preStocks?.tokenPrice ?? asset.tokenPrice, markPrice: history.preStocks?.markPrice ?? asset.markPrice, liquidityUsd: history.pool.liquidityUsd, volume24hUsd: history.pool.volume24hUsd, latestClose: latest.close, latestCandleTime: latest.time, fetchedAt: history.fetchedAt });
        const movement = quoteMovement(asset.symbol, history.preStocks?.tokenPrice ?? asset.tokenPrice);
        setResults((previous) => ({ ...previous, [asset.symbol]: { state: "ready", label: quality.label, flags: quality.flags, movement, updatedAt: history.fetchedAt } }));
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        setResults((previous) => ({ ...previous, [asset.symbol]: { state: "error" } }));
      }
    }));
    setRefreshing(false);
  }, [monitored]);

  useEffect(() => {
    const controller = new AbortController();
    const initial = window.setTimeout(() => void refresh(controller.signal), 0);
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh(controller.signal);
    }, 10 * 60 * 1000);
    const onVisible = () => { if (document.visibilityState === "visible") void refresh(controller.signal); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { controller.abort(); window.clearTimeout(initial); window.clearInterval(interval); document.removeEventListener("visibilitychange", onVisible); };
  }, [refresh]);

  if (!monitored.length) return null;
  return <section className="watchlist-monitor" aria-label="Saved company market checks">
    <div className="watchlist-monitor-heading"><div><strong>Market checks</strong><span>While Vestra is open</span></div><button type="button" className="text-button" onClick={() => void refresh()} disabled={refreshing} aria-label="Refresh saved company market checks"><RefreshCw size={13} aria-hidden="true" /></button></div>
    <ul>{monitored.map((asset) => {
      const result = results[asset.symbol];
      return <li key={asset.symbol} className={result?.state === "ready" && (result.flags?.length ?? 0) > 0 ? "has-flags" : ""}>
        <span className="watchlist-monitor-dot" aria-hidden="true" />
        <span className="watchlist-monitor-copy"><strong>{asset.name.replace(/\s+PreStocks$/i, "")}</strong><span>{result?.state === "loading" || !result ? "Checking market…" : result.state === "error" ? "Could not check market" : result.flags?.[0] ?? result.label}</span>{result?.state === "ready" && result.movement ? <span>{result.movement}</span> : null}</span>
        {result?.state === "ready" && (result.flags?.length ?? 0) > 0 ? <TriangleAlert size={13} aria-label={`${result.flags?.length} market flags`} /> : <span className="watchlist-monitor-time">{result?.state === "ready" ? timeLabel(result.updatedAt) : ""}</span>}
      </li>;
    })}</ul>
    <small>{assets.length > 5 ? "Checking the first five saved companies. " : ""}Quote history stays in this browser. Refreshes every 10 minutes; no Telegram or background alerts.</small>
  </section>;
}

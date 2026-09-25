"use client";

import { ExternalLink, Newspaper, Radio, RefreshCw, TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { PreStock } from "@/lib/prestocks";
import { analyzeMarketQuality } from "@/lib/market-quality";

type Article = { id: string; title: string; url: string; publisher: string; publishedAt: string | null; relevance?: "company_mention" | "company_publisher" | "broader_context" };
type Candle = { time: number; open: number; high: number; low: number; close: number; volume: number };
type Market = { fetchedAt: string; pool: { address: string; name: string; liquidityUsd: number; volume24hUsd: number }; candles: Candle[]; error?: string };

const usd = (value: number | null | undefined) => value == null || !Number.isFinite(value) ? "—" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: value < 1 ? 5 : 2 }).format(value);
const compact = (value: number | null | undefined) => value == null || !Number.isFinite(value) ? "—" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(value);
const dateLabel = (value: string | number) => {
  const date = typeof value === "number" ? new Date(value * 1000) : new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(date);
};

function eventWindow(article: Article | undefined, candles: Candle[]) {
  if (!article?.publishedAt || !candles.length) return null;
  const eventDate = Date.parse(article.publishedAt);
  if (!Number.isFinite(eventDate)) return null;
  const eventDay = Math.floor(eventDate / 86_400_000) * 86_400;
  const before = candles.reduce<Candle | null>((found, candle) => candle.time < eventDay ? candle : found, null);
  const after = candles.find((candle) => candle.time > eventDay);
  if (!before) return { before: null, after: null, change: null };
  return { before, after: after ?? null, change: after ? (after.close / before.close - 1) * 100 : null };
}

export function CatalystMonitor({ asset, articles, newsState, newsError, onRefresh }: { asset: PreStock; articles: Article[]; newsState: "loading" | "ready" | "empty" | "error"; newsError: string; onRefresh: () => void }) {
  const [market, setMarket] = useState<Market | null>(null);
  const [marketState, setMarketState] = useState<"loading" | "ready" | "error">("loading");
  const [selectedId, setSelectedId] = useState("");
  const companyNews = useMemo(() => articles.filter((article) => article.relevance !== "broader_context"), [articles]);
  const broaderNews = useMemo(() => articles.filter((article) => article.relevance === "broader_context"), [articles]);
  const selected = companyNews.find((article) => article.id === selectedId) ?? companyNews[0];
  const window = useMemo(() => eventWindow(selected, market?.candles ?? []), [selected, market]);
  const latest = market?.candles.at(-1);
  const quality = market && latest ? analyzeMarketQuality({ tokenPrice: asset.tokenPrice, markPrice: asset.markPrice, liquidityUsd: market.pool.liquidityUsd, volume24hUsd: market.pool.volume24hUsd, latestClose: latest.close, latestCandleTime: latest.time, fetchedAt: market.fetchedAt }) : null;
  const quoteGap = quality?.quoteGapPercent ?? null;
  const markGap = quality?.markGapPercent ?? null;
  const qualityFlags = quality?.flags ?? [];
  const qualityLabel = quality?.label ?? "Market read unavailable";

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/market-history?mint=${encodeURIComponent(asset.mint)}`, { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json() as Market;
        if (!response.ok) throw new Error(payload.error || "Pool data unavailable");
        setMarket(payload);
        setMarketState("ready");
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") return;
        setMarketState("error");
      });
    return () => controller.abort();
  }, [asset.mint]);

  return <section className="panel catalyst-monitor" aria-labelledby="catalyst-monitor-title">
    <div className="catalyst-monitor-heading"><div><span className="eyebrow"><Radio size={13} aria-hidden="true" /> CATALYST MONITOR</span><h3 id="catalyst-monitor-title">What changed — and what the market shows</h3><p>Company sources and Solana pool data, kept side by side.</p></div><div className="catalyst-heading-tools"><span className="catalyst-time-label">Daily closes · UTC</span><button type="button" className="text-button" onClick={onRefresh} disabled={newsState === "loading"} aria-label="Refresh company headlines"><RefreshCw size={13} aria-hidden="true" /></button></div></div>
    <div className="catalyst-monitor-grid">
      <div className="catalyst-monitor-events">
        <div className="catalyst-monitor-subhead"><span className="eyebrow">COMPANY HEADLINES</span><span>{newsState === "loading" ? "Searching…" : `${companyNews.length} linked · ${broaderNews.length} broader`}</span></div>
        {newsState === "loading" ? <div className="catalyst-monitor-empty"><span className="history-spinner" />Searching recent company coverage…</div> : newsState === "error" ? <div className="catalyst-monitor-empty">{newsError} <button type="button" className="text-button" onClick={onRefresh}>Try again</button></div> : companyNews.length ? <>
          <div className="catalyst-monitor-list">{companyNews.slice(0, 4).map((article) => <button id={article.id} className={`catalyst-monitor-item ${selected?.id === article.id ? "active" : ""}`} type="button" key={article.id} onClick={() => setSelectedId(article.id)}><span className="catalyst-monitor-item-meta">{article.relevance === "company_publisher" ? "Company source" : "Company named"} · {dateLabel(article.publishedAt ?? "")}</span><strong>{article.title}</strong><span className="catalyst-monitor-publisher">{article.publisher}</span></button>)}</div>
          {companyNews.length > 4 && <details className="broader-news-disclosure"><summary>Show {companyNews.length - 4} more company headlines</summary><div className="catalyst-monitor-list">{companyNews.slice(4).map((article) => <button id={article.id} className={`catalyst-monitor-item ${selected?.id === article.id ? "active" : ""}`} type="button" key={article.id} onClick={() => setSelectedId(article.id)}><span className="catalyst-monitor-item-meta">{article.relevance === "company_publisher" ? "Company source" : "Company named"} · {dateLabel(article.publishedAt ?? "")}</span><strong>{article.title}</strong><span className="catalyst-monitor-publisher">{article.publisher}</span></button>)}</div></details>}
          {selected && <a className="catalyst-open-source" href={selected.url} target="_blank" rel="noreferrer">Open selected source <ExternalLink size={12} aria-hidden="true" /></a>}
          <div className="provider-footnote"><Newspaper size={13} aria-hidden="true" /><span>Google News · opens at publisher</span></div>
        </> : <div className="catalyst-monitor-empty">{newsState === "empty" ? `No recent coverage found for ${asset.name.replace(/\s+PreStocks$/i, ".")}` : `No headline names ${asset.name.replace(/\s+PreStocks$/i, "")} or comes from its publisher. Broad results stay out of the AI debate.`}</div>}
        {broaderNews.length > 0 && <details className="broader-news-disclosure"><summary>{broaderNews.length} broader result{broaderNews.length === 1 ? "" : "s"} excluded from AI review</summary><ul>{broaderNews.slice(0, 4).map((article) => <li key={article.id}>{article.title} <span>· {article.publisher}</span></li>)}</ul></details>}
      </div>
      <div className="catalyst-market-context">
        <div className="catalyst-monitor-subhead"><span className="eyebrow">MARKET CONTEXT</span><span>{marketState === "ready" ? market?.pool.name : marketState === "loading" ? "Loading pool data…" : "Pool data unavailable"}</span></div>
        {marketState === "ready" && market && latest ? <>
          <div className="catalyst-context-values">
            <div><span>PreStocks quote</span><strong>{usd(asset.tokenPrice)}</strong></div>
            <div><span>Reference mark</span><strong>{usd(asset.markPrice)}</strong><small>{markGap === null ? "Gap unavailable" : `${markGap >= 0 ? "+" : ""}${markGap.toFixed(2)}% vs. mark`}</small></div>
            <div><span>Latest pool close</span><strong>{usd(latest.close)}</strong><small>{dateLabel(latest.time)} · {quoteGap === null ? "Gap unavailable" : `${quoteGap >= 0 ? "+" : ""}${quoteGap.toFixed(1)}% vs. PreStocks quote`}</small></div>
            <div><span>Pool liquidity · 24h traded</span><strong>{compact(market.pool.liquidityUsd)} · {compact(market.pool.volume24hUsd)}</strong><small>Liquidity is not guaranteed exit capacity</small></div>
          </div>
          <div className={`catalyst-quality-note ${qualityFlags.length === 0 ? "calm" : ""}`}>
            {qualityFlags.length > 0 ? <TriangleAlert size={14} aria-hidden="true" /> : <span aria-hidden="true">✓</span>}
            <span><strong>{qualityLabel}</strong> · {qualityFlags.length > 0 ? `${qualityFlags.join(". ")}. ` : "No large gap, very low activity, or stale-close flag in this snapshot. "}These checks do not establish fair value or guarantee exit liquidity.</span>
          </div>
          <small className="catalyst-quality-thresholds">Flags: quote/mark gap over 20% · liquidity under $10k · under $1k traded in 24h · daily close older than 2 days</small>
          <div className="catalyst-event-window"><span className="eyebrow">POOL CLOSES AROUND SELECTED HEADLINE</span>{!selected ? <p>Select a company headline to compare nearby closes.</p> : !window?.before ? <p>No completed pool close is available before this headline date.</p> : <p>Before ({dateLabel(window.before.time)}): <strong>{usd(window.before.close)}</strong>{window.after ? <> · After ({dateLabel(window.after.time)}): <strong>{usd(window.after.close)}</strong> · <strong className={window.change! >= 0 ? "positive" : "negative"}>{window.change! >= 0 ? "+" : ""}{window.change!.toFixed(2)}%</strong></> : " · No later daily close yet"}</p>}<small>Timing comparison only; it cannot show that the headline caused a price move.</small></div>
        </> : <div className="catalyst-monitor-empty">{marketState === "loading" ? "Finding an active USDC pool and its latest completed close…" : "Vestra could not find enough active pool data for this company."}</div>}
      </div>
    </div>
  </section>;
}

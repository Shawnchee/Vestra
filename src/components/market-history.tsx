"use client";

import { Activity, ChevronDown, ChevronLeft, ChevronRight, ExternalLink, Pause, Play, RefreshCw, TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Vela as VelaChart } from "@luxalgo/vela";

type Candle = { time: number; open: number; high: number; low: number; close: number; volume: number };
type History = {
  fetchedAt: string;
  pool: { address: string; name: string; liquidityUsd: number; volume24hUsd: number };
  candles: Candle[];
  error?: string;
};
type Article = { id: string; title: string; url: string; publisher: string; publishedAt: string | null };
type CryptoStory = { id: string; title: string; url: string; topic: string; author: string; summary: string; publishedAt: string };

const usd = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: value < 1 ? 5 : 2 }).format(value);
const compactUsd = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 2 }).format(value);
const candleDate = (time: number) => new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(time * 1000));

export function MarketHistory({ mint, ticker, tokenPrice, articles = [] }: { mint: string; ticker: string; tokenPrice: number | null; articles?: Article[] }) {
  const [data, setData] = useState<History | null>(null);
  const [cryptoStories, setCryptoStories] = useState<CryptoStory[]>([]);
  const [cryptoError, setCryptoError] = useState("");
  const [cryptoLoading, setCryptoLoading] = useState(true);
  const [cryptoFetchedAt, setCryptoFetchedAt] = useState<string | null>(null);
  const [cryptoRevision, setCryptoRevision] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState<30 | 90>(90);
  const [replayIndex, setReplayIndex] = useState<number | null>(null);
  const [isReplaying, setIsReplaying] = useState(false);
  const [revision, setRevision] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<Article | null>(null);
  const [velaError, setVelaError] = useState("");
  const [velaLoading, setVelaLoading] = useState(false);
  const chartHost = useRef<HTMLDivElement>(null);
  const vela = useRef<VelaChart | null>(null);
  const velaReady = useRef(false);

  function refresh() {
    setLoading(true);
    setError("");
    setData(null);
    setRevision((value) => value + 1);
  }

  function refreshCrypto() {
    setCryptoLoading(true);
    setCryptoError("");
    setCryptoRevision((value) => value + 1);
  }

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/market-history?mint=${encodeURIComponent(mint)}`, { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json() as History;
        if (!response.ok) throw new Error(payload.error || "Could not load token history.");
        setData(payload);
        setReplayIndex(null);
        setIsReplaying(false);
      })
      .catch((reason: unknown) => {
        if (reason instanceof Error && reason.name === "AbortError") return;
        setError(reason instanceof Error ? reason.message : "Could not load token history.");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [mint, revision]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/crypto-news", { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json() as { stories?: CryptoStory[]; error?: string };
        if (!response.ok) throw new Error(payload.error || "Could not load crypto coverage.");
        setCryptoStories(payload.stories ?? []);
        setCryptoFetchedAt(new Date().toISOString());
      })
      .catch((reason: unknown) => {
        if (reason instanceof Error && reason.name === "AbortError") return;
        setCryptoError(reason instanceof Error ? reason.message : "Could not load crypto coverage.");
      })
      .finally(() => { if (!controller.signal.aborted) setCryptoLoading(false); });
    return () => controller.abort();
  }, [cryptoRevision]);

  const history = useMemo(() => data?.candles ?? [], [data]);
  const candles = useMemo(() => {
    const allCandles = history;
    const latestTime = allCandles.at(-1)?.time;
    if (!latestTime) return [];
    const firstAllowedTime = latestTime - days * 86400;
    return allCandles.filter((candle) => candle.time >= firstAllowedTime);
  }, [history, days]);
  const chart = useMemo(() => {
    if (candles.length < 2) return null;
    const change = ((candles[candles.length - 1].close / candles[0].close) - 1) * 100;
    return { last: candles[candles.length - 1].close, change };
  }, [candles]);
  const activeReplayIndex = Math.min(replayIndex ?? Math.max(0, candles.length - 1), Math.max(0, candles.length - 1));
  const replayCandle = candles[activeReplayIndex];
  const replayPrevious = activeReplayIndex > 0 ? candles[activeReplayIndex - 1] : null;
  const replayChange = replayCandle && replayPrevious ? (replayCandle.close / replayPrevious.close - 1) * 100 : null;
  const replayTotalChange = replayCandle && candles[0] ? (replayCandle.close / candles[0].close - 1) * 100 : null;

  useEffect(() => {
    if (!isReplaying || candles.length < 2) return;
    const timer = window.setTimeout(() => {
      if (activeReplayIndex >= candles.length - 1) setIsReplaying(false);
      else setReplayIndex(activeReplayIndex + 1);
    }, 650);
    return () => window.clearTimeout(timer);
    }, [isReplaying, candles.length, activeReplayIndex]);

  const poolQuoteGap = chart && tokenPrice && tokenPrice > 0 ? (chart.last / tokenPrice - 1) * 100 : null;
  const mismatch = poolQuoteGap !== null && Math.abs(poolQuoteGap) > 20;
  const thinActivity = data ? data.pool.volume24hUsd < 1000 : false;
  const datedArticles = useMemo(() => articles.filter((article) => article.publishedAt && Number.isFinite(Date.parse(article.publishedAt))).slice(0, 5), [articles]);

  useEffect(() => {
    if (!chartHost.current || candles.length < 2) return;
    let disposed = false;
    let instance: VelaChart | null = null;
    setVelaLoading(true);
    setVelaError("");
    velaReady.current = false;
    void import("@luxalgo/vela").then(({ Vela }) => {
      if (disposed || !chartHost.current) return;
      instance = new Vela(chartHost.current, {
        symbol: `PreStocks:${ticker}`,
        timeframe: "1D",
        data: candles.map((candle) => ({ ...candle, time: candle.time * 1000 })),
        theme: "dark",
        height: 360,
        currentPriceLine: true,
        drawings: { toolbar: false },
      });
      vela.current = instance;
      instance.marks.defineGroup({ id: "news", label: "Company news" });
      for (const article of datedArticles) {
        instance.marks.add({
          id: article.id,
          time: Date.parse(article.publishedAt!),
          title: article.publisher,
          tooltip: article.title,
          group: "news",
          glyph: { shape: "diamond", color: "#dfb86c", letter: "N" },
          content: { text: article.title },
        });
      }
      instance.on("mark:click", (event) => {
        const article = datedArticles.find((item) => item.id === event.id);
        if (article) setSelectedEvent(article);
      });
      void instance.ready().then(() => {
        if (!disposed) {
          velaReady.current = true;
          setVelaLoading(false);
        }
      }).catch((reason: unknown) => {
        if (!disposed) {
          setVelaLoading(false);
          setVelaError(reason instanceof Error ? reason.message : "Could not draw the market history.");
        }
      });
    }).catch((reason: unknown) => {
      if (!disposed) {
        setVelaLoading(false);
        setVelaError(reason instanceof Error ? reason.message : "Could not load the Vela chart.");
      }
    });
    return () => {
      disposed = true;
      instance?.destroy();
      if (vela.current === instance) vela.current = null;
      velaReady.current = false;
    };
  }, [candles, datedArticles, mint, ticker]);

  useEffect(() => {
    if (!vela.current || !velaReady.current || !replayCandle) return;
    void vela.current.setMarket({
      data: candles.slice(0, activeReplayIndex + 1).map((candle) => ({ ...candle, time: candle.time * 1000 })),
    }).catch((reason: unknown) => {
      setVelaError(reason instanceof Error ? reason.message : "Could not update the replay chart.");
    });
  }, [activeReplayIndex, candles, replayCandle]);
  const replay = useMemo(() => {
    const article = selectedEvent && datedArticles.find((item) => item.id === selectedEvent.id && item.url === selectedEvent.url);
    if (!article || !candles.length) return null;
    const eventTime = Date.parse(article.publishedAt!) / 1000;
    const eventDay = Math.floor(eventTime / 86400) * 86400;
    // Exclude the event-day candle from both observations: its close may occur
    // after publication, so including it would introduce look-ahead bias.
    const beforeIndex = candles.reduce((found, candle, index) => candle.time < eventDay ? index : found, -1);
    const afterIndex = candles.findIndex((candle) => candle.time > eventDay);
    if (beforeIndex < 0) return { article, outside: true as const };
    const before = candles[beforeIndex];
    const after = afterIndex >= 0 ? candles[afterIndex] : null;
    return { article, outside: false as const, before, after, change: after ? (after.close / before.close - 1) * 100 : null };
  }, [candles, datedArticles, selectedEvent]);

  return <section className="panel history-panel" aria-labelledby="history-title">
    <div className="panel-heading history-heading"><div><span className="eyebrow">SOLANA TRADING PRICES</span><h3 id="history-title">Market movement</h3></div><div className="history-controls"><div className="range-toggle" role="group" aria-label="Chart range"><button type="button" className={days === 30 ? "selected" : ""} onClick={() => { setDays(30); setReplayIndex(null); setIsReplaying(false); }}>30D</button><button type="button" className={days === 90 ? "selected" : ""} onClick={() => { setDays(90); setReplayIndex(null); setIsReplaying(false); }}>90D</button></div><button type="button" className="text-button" aria-label="Refresh price history" onClick={refresh}><RefreshCw size={14} aria-hidden="true" /></button></div></div>
    {loading ? <div className="history-state" role="status"><span className="history-spinner" /><span>Finding a USDC pool…</span></div> : error ? <div className="history-state history-error" role="status"><Activity size={19} aria-hidden="true" /><div><strong>Price history unavailable</strong><span>{error}</span></div><button type="button" className="text-button" onClick={refresh}>Retry</button></div> : data && chart ? <>
      <div className="history-stats"><div><span className="eyebrow">LAST COMPLETED CLOSE</span><strong>{usd(chart.last)}</strong><span className="history-stat-note">{candleDate(candles[candles.length - 1].time)} UTC</span></div><div><span className="eyebrow">{days}-DAY CHANGE</span><strong className={chart.change >= 0 ? "positive" : "negative"}>{chart.change >= 0 ? "+" : ""}{chart.change.toFixed(2)}%</strong></div><div><span className="eyebrow">LIQUIDITY IN POOL</span><strong>{compactUsd(data.pool.liquidityUsd)}</strong></div><div><span className="eyebrow">24H TRADED</span><strong>{compactUsd(data.pool.volume24hUsd)}</strong></div></div>
      <div className="vela-chart-frame"><div className="vela-chart" ref={chartHost} role="group" aria-label={`Daily price chart with ${candles.length} candles`} />{velaLoading && <div className="vela-loading" role="status"><span className="history-spinner" />Loading chart…</div>}</div>{velaError && <div className="history-state history-error" role="status">Could not load chart: {velaError}</div>}
      {replayCandle && <div className="history-replay" aria-label="Historical price replay">
        <div className="history-replay-reading"><div><span className="eyebrow">PRICE REPLAY</span><strong>{candleDate(replayCandle.time)}</strong><span>Day {activeReplayIndex + 1} of {candles.length}</span></div><div><span className="eyebrow">CLOSE</span><strong>{usd(replayCandle.close)}</strong></div><div><span className="eyebrow">DAY MOVE</span><strong className={replayChange === null ? "" : replayChange >= 0 ? "positive" : "negative"}>{replayChange === null ? "—" : `${replayChange >= 0 ? "+" : ""}${replayChange.toFixed(2)}%`}</strong></div><div><span className="eyebrow">FROM START</span><strong className={replayTotalChange === null ? "" : replayTotalChange >= 0 ? "positive" : "negative"}>{replayTotalChange === null ? "—" : `${replayTotalChange >= 0 ? "+" : ""}${replayTotalChange.toFixed(2)}%`}</strong></div></div>
        <div className="history-replay-controls"><button type="button" className="text-button" aria-label="Previous day" disabled={activeReplayIndex === 0} onClick={() => { setIsReplaying(false); setReplayIndex(Math.max(0, activeReplayIndex - 1)); }}><ChevronLeft size={16} aria-hidden="true" /></button><input type="range" min={0} max={Math.max(0, candles.length - 1)} value={activeReplayIndex} aria-label="Scrub daily pool prices" aria-valuetext={`${candleDate(replayCandle.time)}, close ${usd(replayCandle.close)}`} onChange={(event) => { setIsReplaying(false); setReplayIndex(Number(event.target.value)); }} /><button type="button" className="text-button" aria-label="Next day" disabled={activeReplayIndex >= candles.length - 1} onClick={() => { setIsReplaying(false); setReplayIndex(Math.min(candles.length - 1, activeReplayIndex + 1)); }}><ChevronRight size={16} aria-hidden="true" /></button><button type="button" className="replay-play" onClick={() => { if (isReplaying) setIsReplaying(false); else { setReplayIndex(0); setIsReplaying(true); } }} disabled={candles.length < 2}>{isReplaying ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}{isReplaying ? "Pause" : "Play"}</button></div>
      </div>}
      {(mismatch || thinActivity) && <div className="history-warning"><TriangleAlert size={15} aria-hidden="true" /><span>{mismatch && `The selected pool's latest USD close is ${Math.abs(poolQuoteGap!).toFixed(1)}% ${poolQuoteGap! >= 0 ? "above" : "below"} the PreStocks catalogue quote. PreStocks publishes separate token and mark fields, but does not document how they reconcile with individual pools. This comparison is not a trade signal. `}{thinActivity && "Under $1,000 traded in this pool in the last 24 hours, so prices may be unreliable."}</span></div>}
      <details className="history-details"><summary><span className="details-title"><strong>Crypto news</strong><span>CoinDesk · general market context</span></span><ChevronDown size={16} aria-hidden="true" /></summary><div className="details-body"><div className="crypto-context"><div className="crypto-context-heading"><div><span className="eyebrow">CRYPTO MARKET CONTEXT</span><p>General crypto news. These stories are not used in the company debate.</p></div><div className="crypto-heading-actions"><span className="crypto-source-badge">COINDESK</span><button type="button" className="text-button crypto-refresh" onClick={refreshCrypto} disabled={cryptoLoading} aria-label="Refresh crypto news"><RefreshCw size={14} aria-hidden="true" /></button></div></div>{cryptoLoading ? <div className="crypto-loading" role="status"><span className="history-spinner" />Loading crypto news…</div> : cryptoError ? <p className="catalyst-empty">{cryptoError}</p> : <div className="crypto-stories">{cryptoStories.slice(0, 4).map((story) => <a className="crypto-story" href={story.url} key={story.id} target="_blank" rel="noreferrer"><span className="crypto-topic">{story.topic} · {new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(new Date(story.publishedAt))} UTC</span><strong>{story.title}</strong>{story.summary && <span className="crypto-summary">{story.summary}</span>}</a>)}</div>}<div className="crypto-context-footnote"><span>General market context only; not company evidence.{cryptoFetchedAt && <> Updated {new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(new Date(cryptoFetchedAt))} UTC.</>}</span><a href="https://www.coindesk.com/arc/outboundfeeds/rss/" target="_blank" rel="noreferrer">CoinDesk RSS <ExternalLink size={11} aria-hidden="true" /></a></div></div></div></details>
      <details className="history-details"><summary><span className="details-title"><strong>Headline replay</strong><span>Company news · timing only, not cause</span></span><ChevronDown size={16} aria-hidden="true" /></summary><div className="details-body"><div className="catalyst-replay"><div className="catalyst-heading"><div><span className="eyebrow">HEADLINE REPLAY</span><p>Compare pool closes before and after the headline’s UTC date. The headline-day close is skipped.</p></div><span className="replay-badge">TIMING ONLY</span></div>{datedArticles.length ? <div className="catalyst-events">{datedArticles.map((article) => <button type="button" className={`catalyst-event ${selectedEvent?.url === article.url ? "active" : ""}`} key={article.id} onClick={() => setSelectedEvent((current) => current?.url === article.url ? null : article)}><span className="catalyst-date">{new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(article.publishedAt!))}</span><span className="catalyst-title">{article.title}</span><span className="catalyst-source">{article.publisher}</span></button>)}</div> : <p className="catalyst-empty">No dated headlines to replay.</p>}{replay && <div className="replay-result" aria-live="polite">{replay.outside ? <span>This headline is outside the {days}-day chart period.</span> : <><strong>{replay.article.publisher} · {new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(replay.article.publishedAt!))}</strong><span>Prior close ({candleDate(replay.before.time)}): {usd(replay.before.close)} · volume {compactUsd(replay.before.volume)}{replay.after && <>. Next close ({candleDate(replay.after.time)}): {usd(replay.after.close)} · volume {compactUsd(replay.after.volume)} · move {replay.change! >= 0 ? "+" : ""}{replay.change!.toFixed(2)}%</>}{!replay.after && ". No later daily close available."}</span><a href={replay.article.url} target="_blank" rel="noreferrer">Open headline <ExternalLink size={11} aria-hidden="true" /></a></>}</div>}</div></div></details>
      <div className="history-source"><span>GeckoTerminal · {data.pool.name} · {data.pool.volume24hUsd > 0 ? `${compactUsd(data.pool.volume24hUsd)} 24h volume` : "volume unavailable"}</span><span className="chart-links"><a href={`https://www.geckoterminal.com/solana/pools/${data.pool.address}`} target="_blank" rel="noreferrer">View pool <ExternalLink size={11} aria-hidden="true" /></a><a href="https://luxalgo.com/vela" target="_blank" rel="noreferrer">Chart by LuxAlgo Vela <ExternalLink size={11} aria-hidden="true" /></a></span></div>
    </> : <div className="history-state"><Activity size={19} aria-hidden="true" /><span>Not enough daily candles to draw a useful chart.</span></div>}
  </section>;
}

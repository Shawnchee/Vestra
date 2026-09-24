"use client";

import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Bookmark,
  ChevronDown,
  ExternalLink,
  FileSearch,
  Landmark,
  Layers3,
  LoaderCircle,
  Newspaper,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Waves,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { PreStock } from "@/lib/prestocks";

type Article = { id: string; title: string; url: string; publisher: string; publishedAt: string | null; sourceCountry?: string | null };
type Seat = {
  thesis: string;
  claims: { text: string; evidenceIds: string[] }[];
  uncertainties: string[];
  confidence: "low" | "medium" | "high";
  falsifiers: string[];
};
type Debate = { bull: Seat; bear: Seat; editor: Seat; model: string; generatedAt: string };

function SeatView({ title, kind, seat, articles }: { title: string; kind: "bull" | "bear" | "editor"; seat: Seat; articles: Article[] }) {
  return (
    <article className={`seat-card seat-${kind}`}>
      <div className="seat-topline"><span className={`seat-dot ${kind}`} /><span className="eyebrow">{title}</span><span className="confidence">{seat.confidence} confidence</span></div>
      <p className="seat-thesis">{seat.thesis}</p>
      <div className="claims-list">
        {seat.claims.map((claim, index) => {
          const refs = claim.evidenceIds.map((id) => articles.find((article) => article.id === id)).filter((article): article is Article => Boolean(article));
          return <div className="claim" key={`${kind}-${index}`}>
            <p>{claim.text}</p>
            {refs.length > 0
              ? <div className="citation-row">{refs.map((article) => <a className="citation" key={article.id} href={`#${article.id}`}>{article.publisher}<span aria-hidden="true"> ↗</span></a>)}</div>
              : <span className="unverified"><ShieldCheck size={13} aria-hidden="true" /> No matching source linked</span>}
          </div>;
        })}
      </div>
      {seat.uncertainties.length > 0 && <div className="seat-footnote"><span className="eyebrow">Open questions</span><p>{seat.uncertainties[0]}</p></div>}
      {seat.falsifiers.length > 0 && <div className="seat-footnote"><span className="eyebrow">What could change this view</span><p>{seat.falsifiers[0]}</p></div>}
    </article>
  );
}

const money = (value: number | null, digits = 2) => value === null ? "—" : new Intl.NumberFormat("en-US", {
  style: "currency", currency: "USD", minimumFractionDigits: digits, maximumFractionDigits: digits,
}).format(value);

const compactMoney = (value: number | null) => value === null ? "—" : new Intl.NumberFormat("en-US", {
  style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 2,
}).format(value);

const shortNumber = (value: number | null) => value === null ? "—" : new Intl.NumberFormat("en-US", {
  notation: "compact", maximumFractionDigits: 2,
}).format(value);

function timeLabel(value: string | null) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
}

export function ResearchDesk({ assets, fetchedAt, error }: { assets: PreStock[]; fetchedAt: string; error: string | null }) {
  const initial = useMemo(() => assets.find((asset) => asset.symbol === "SPACEX") ?? assets.find((asset) => asset.symbol === "ANTHROPIC") ?? assets[0], [assets]);
  const [symbol, setSymbol] = useState(initial?.symbol ?? "");
  const asset = assets.find((item) => item.symbol === symbol) ?? initial;
  const [articles, setArticles] = useState<Article[]>([]);
  const [newsState, setNewsState] = useState<"loading" | "ready" | "empty" | "error">("loading");
  const [newsError, setNewsError] = useState("");
  const [debate, setDebate] = useState<Debate | null>(null);
  const [debateError, setDebateError] = useState("");
  const [debateLoading, setDebateLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadNews = useCallback(async () => {
    if (!asset) return;
    setNewsState("loading");
    setNewsError("");
    setDebate(null);
    setDebateError("");
    try {
      const company = asset.name.replace(/\s+PreStocks$/i, "");
      const response = await fetch(`/api/news?company=${encodeURIComponent(company)}`);
      const payload = await response.json() as { articles?: Article[]; error?: string };
      if (!response.ok) throw new Error(payload.error || "Could not load company news.");
      const nextArticles = payload.articles ?? [];
      setArticles(nextArticles);
      setNewsState(nextArticles.length ? "ready" : "empty");
    } catch (reason) {
      setArticles([]);
      setNewsState("error");
      setNewsError(reason instanceof Error ? reason.message : "Could not load company news.");
    }
  }, [asset]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadNews(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadNews]);

  const premium = asset?.tokenPrice !== null && asset?.markPrice !== null && asset?.markPrice !== undefined && asset.markPrice !== 0
    ? ((asset.tokenPrice! / asset.markPrice) - 1) * 100
    : null;

  async function runDebate() {
    if (!asset) return;
    setDebateLoading(true);
    setDebateError("");
    setDebate(null);
    try {
      const response = await fetch("/api/debate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: asset.name,
          evidence: articles,
          market: { tokenPrice: asset.tokenPrice, markPrice: asset.markPrice, premiumPercent: premium, observedAt: fetchedAt },
        }),
      });
      const payload = await response.json() as Debate & { error?: string };
      if (!response.ok) throw new Error(payload.error || "Could not run the research room.");
      setDebate(payload);
    } catch (reason) {
      setDebateError(reason instanceof Error ? reason.message : "Could not run the research room.");
    } finally {
      setDebateLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand-lockup" href="#top" aria-label="Vestra home"><span className="brand-mark">V</span><span>vestra</span></a>
        <div className="workspace-label">RESEARCH WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <a className="nav-item active" href="#desk"><Activity size={17} aria-hidden="true" />Research desk</a>
          <a className="nav-item" href="#news"><Newspaper size={17} aria-hidden="true" />Company news</a>
          <a className="nav-item" href="#debate"><Sparkles size={17} aria-hidden="true" />Research room<span className="nav-new">AI</span></a>
          <a className="nav-item" href="#market"><Layers3 size={17} aria-hidden="true" />Market context</a>
        </nav>
        <div className="sidebar-divider" />
        <div className="workspace-label">YOUR COVERAGE <button className="icon-button small" aria-label="Add a company"><span aria-hidden="true">+</span></button></div>
        <div className="watchlist">{assets.slice(0, 4).map((item) => <button type="button" className={`watch-item ${asset?.symbol === item.symbol ? "selected" : ""}`} key={item.symbol} onClick={() => setSymbol(item.symbol)}><span className="watch-avatar">{item.symbol.slice(0, 1)}</span><span>{item.name.replace(" PreStocks", "")}</span><span className="watch-dot" /></button>)}</div>
        <div className="sidebar-spacer" />
        <div className="plan-card"><span className="plan-icon"><Landmark size={16} aria-hidden="true" /></span><div><strong>PreStocks data</strong><span>On-chain company exposure</span></div><span className="live-dot" /></div>
        <div className="sidebar-user"><div className="user-avatar">V</div><div><strong>Research desk</strong><span>Personal workspace</span></div><ChevronDown size={15} aria-hidden="true" /></div>
      </aside>

      <main className="main-area" id="top">
        <header className="topbar"><div className="crumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>Research desk</strong></div><div className="top-actions"><span className="network-pill"><span className="solana-mark">◈</span>Solana</span><button className="icon-button" aria-label="Search companies"><Search size={17} aria-hidden="true" /></button><button type="button" className={`icon-button ${saved ? "saved" : ""}`} aria-label={saved ? "Remove from saved" : "Save this research"} onClick={() => setSaved(!saved)}><Bookmark size={17} aria-hidden="true" fill={saved ? "currentColor" : "none"} /></button></div></header>

        <div className="content-wrap">
          <section className="page-heading" id="desk"><div><div className="overline"><span className="live-dot" />PRIVATE MARKETS, IN PLAIN SIGHT</div><h1>Research desk</h1><p>Follow the company story. See the market context. Challenge the consensus.</p></div><div className="heading-actions"><span className="updated-label"><RefreshCw size={13} aria-hidden="true" />Updated {timeLabel(fetchedAt)}</span><button type="button" className="outline-button" onClick={() => void loadNews()}><RefreshCw size={14} aria-hidden="true" />Refresh coverage</button></div></section>

          {!asset ? <section className="empty-panel" role="status"><FileSearch size={24} aria-hidden="true" /><h2>PreStocks data is unavailable</h2><p>{error ?? "Try refreshing to load the current company catalogue."}</p><a className="outline-button as-link" href="https://prestocks.com/products" target="_blank" rel="noreferrer">View PreStocks <ExternalLink size={14} aria-hidden="true" /></a></section> : <>
            <section className="company-banner" style={{ backgroundImage: "linear-gradient(90deg, rgba(14,18,16,.98) 0%, rgba(14,18,16,.93) 40%, rgba(14,18,16,.46) 100%), url('/images/vestra-market-atmosphere.png')" }}>
              <div className="company-info"><div className="company-avatar">{asset.symbol.slice(0, 1)}</div><div><span className="company-category">PRESTOCKS · PRIVATE COMPANY</span><div className="company-title-row"><h2>{asset.name.replace(" PreStocks", "")}</h2><span className="ticker-badge">{asset.symbol}</span></div><p className="company-description">{asset.description.split("\n")[0]}</p></div></div>
              <div className="company-picker-wrap"><label htmlFor="company-select">Company</label><select id="company-select" value={asset.symbol} onChange={(event) => setSymbol(event.target.value)}>{assets.map((item) => <option value={item.symbol} key={item.symbol}>{item.name.replace(" PreStocks", "")}</option>)}</select><ChevronDown size={15} aria-hidden="true" /></div>
            </section>

            <section className="metric-strip" aria-label="PreStocks market snapshot">
              <Metric label="Token price" value={money(asset.tokenPrice)} note="PreStocks market quote" accent />
              <Metric label="Reference mark" value={money(asset.markPrice)} note="PreStocks mark price" />
              <Metric label="Token vs. mark" value={premium === null ? "—" : `${premium > 0 ? "+" : ""}${premium.toFixed(2)}%`} note={premium === null ? "Comparison unavailable" : premium > 0 ? "Premium to mark" : premium < 0 ? "Discount to mark" : "At the reference mark"} semantic={premium === null ? undefined : premium > 0 ? "positive" : premium < 0 ? "negative" : undefined} />
              <Metric label="Implied valuation" value={compactMoney(asset.impliedValuation)} note="Token market implied" />
              <div className="metric-source"><span className="source-check"><ShieldCheck size={14} aria-hidden="true" /></span><div><strong>Source: PreStocks</strong><span>Fetched <time>{new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(new Date(fetchedAt))}</time></span></div></div>
            </section>
            {error && <div className="inline-alert" role="status">Showing no cached company data. {error}</div>}

            <div className="research-grid">
              <section className="panel market-panel" id="market">
                <div className="panel-heading"><div><span className="eyebrow">MARKET CONTEXT</span><h3>Token vs. reference mark</h3></div><span className="panel-icon"><Waves size={16} aria-hidden="true" /></span></div>
                <div className="price-comparison"><div><span className="eyebrow">TOKEN PRICE</span><strong>{money(asset.tokenPrice)}</strong><span className="price-caption">Current PreStocks market quote</span></div><div className="comparison-arrow" aria-hidden="true">↔</div><div><span className="eyebrow">MARK PRICE</span><strong>{money(asset.markPrice)}</strong><span className="price-caption">Reference value</span></div></div>
                <div className="premium-track" aria-label={premium === null ? "Price comparison unavailable" : `Token is ${Math.abs(premium).toFixed(2)} percent ${premium > 0 ? "above" : "below"} the mark price`}><span className="premium-marker" style={{ left: `${premium === null ? 50 : Math.max(8, Math.min(92, 50 + premium * 1.2))}%` }} /></div>
                <div className="track-labels"><span>Below mark</span><span>Above mark</span></div>
                <div className="market-details"><div><span>Circulating supply</span><strong>{shortNumber(asset.supply)}</strong></div><div><span>Mark valuation</span><strong>{compactMoney(asset.markValuation)}</strong></div><div><span>Solana mint</span><a href={`https://explorer.solana.com/address/${asset.mint}`} target="_blank" rel="noreferrer">{asset.mint.slice(0, 5)}…{asset.mint.slice(-5)} <ExternalLink size={12} aria-hidden="true" /></a></div></div>
                <div className="history-note"><Activity size={15} aria-hidden="true" /><div><strong>Price history is hidden pending reconciliation</strong><span>Pool candles exist for this mint, but their USD quote differs from PreStocks’ catalogue price. Vestra keeps backtests off until the units reconcile.</span></div></div>
              </section>

              <section className="panel news-panel" id="news">
                <div className="panel-heading"><div><span className="eyebrow">COMPANY COVERAGE</span><h3>Recent signals</h3></div><button className="text-button" type="button" onClick={() => void loadNews()} aria-label="Refresh recent news"><RefreshCw size={14} aria-hidden="true" /></button></div>
                {newsState === "loading" && <div className="news-loading" aria-label="Loading recent signals">{[0, 1, 2].map((item) => <div className="skeleton-row" key={item}><span /><div><i /><i /></div></div>)}</div>}
                {newsState === "empty" && <div className="empty-inline"><Newspaper size={20} aria-hidden="true" /><strong>No recent coverage found</strong><span>Try again later or review the company’s official updates.</span>{asset.externalUrl && <a href={asset.externalUrl} target="_blank" rel="noreferrer">Open company page <ExternalLink size={12} aria-hidden="true" /></a>}</div>}
                {newsState === "error" && <div className="empty-inline"><Newspaper size={20} aria-hidden="true" /><strong>Coverage did not load</strong><span>{newsError}</span><button className="text-button" type="button" onClick={() => void loadNews()}>Try again</button></div>}
                {newsState === "ready" && <div className="news-list">{articles.slice(0, 5).map((article) => <article className="news-item" id={article.id} key={article.id}><div className="news-meta"><span className="publisher-dot">{article.publisher.slice(0, 1).toUpperCase()}</span><span>{article.publisher}</span><span className="meta-separator">·</span><time>{timeLabel(article.publishedAt)}</time></div><a className="news-title" href={article.url} target="_blank" rel="noreferrer">{article.title}<ExternalLink size={13} aria-hidden="true" /></a></article>)}</div>}
                <div className="provider-footnote"><span className="gdelt-mark">G</span>Discovery by GDELT <span>·</span> headlines link to original publishers</div>
              </section>
            </div>

            <section className="panel debate-panel" id="debate">
              <div className="debate-heading"><div><span className="eyebrow">MULTI-PERSPECTIVE ANALYSIS</span><h3>The research room</h3><p>Three roles. One shared evidence packet. No hidden sources.</p></div><button className="primary-button" type="button" onClick={() => void runDebate()} disabled={debateLoading || newsState !== "ready" || articles.length === 0}>{debateLoading ? <><LoaderCircle className="spin" size={16} aria-hidden="true" />Reading the evidence…</> : <><Sparkles size={16} aria-hidden="true" />Run the debate</>}</button></div>
              {debateError && <div className="inline-alert" role="alert">{debateError}</div>}
              {debate ? <div className="debate-results"><SeatView title="Bull analyst" kind="bull" seat={debate.bull} articles={articles} /><SeatView title="Bear analyst" kind="bear" seat={debate.bear} articles={articles} /><SeatView title="Editor synthesis" kind="editor" seat={debate.editor} articles={articles} /><div className="debate-disclosure">Generated with {debate.model} · {timeLabel(debate.generatedAt)} · Based on headline metadata and the market snapshot shown above.</div></div> : <div className="debate-empty"><div className="seat-orbit"><div className="orbit-node bull-node">B</div><div className="orbit-node bear-node">B</div><div className="orbit-core"><Sparkles size={18} aria-hidden="true" /></div><div className="orbit-node editor-node">E</div></div><div><strong>{newsState === "ready" ? "The evidence is ready for review" : "Load company coverage to begin"}</strong><span>{newsState === "ready" ? "Bull and bear analysts will work from the same headlines, then an editor will make the disagreement legible." : "Vestra needs at least one source item before the research room can start."}</span></div><div className="model-note"><span className="gemini-spark">✳</span>Gemini-powered<br /><small>Free-tier API</small></div></div>}
              <div className="debate-bottom"><span><ShieldCheck size={14} aria-hidden="true" />Evidence-linked analysis</span><span>Not investment advice</span></div>
            </section>

            <footer className="page-footer"><span>Vestra is an independent research tool and is not affiliated with the referenced companies.</span><a href="https://prestocks.com/products" target="_blank" rel="noreferrer">PreStocks assets provide economic exposure only; review product risks <ExternalLink size={12} aria-hidden="true" /></a></footer>
          </>}
        </div>
      </main>
    </div>
  );
}

function Metric({ label, value, note, accent = false, semantic }: { label: string; value: string; note: string; accent?: boolean; semantic?: "positive" | "negative" }) {
  return <div className="metric-cell"><span className="eyebrow">{label}</span><strong className={`${accent ? "accent-value" : ""} ${semantic ?? ""}`}>{semantic === "positive" ? <ArrowUpRight size={16} aria-hidden="true" /> : semantic === "negative" ? <ArrowDownRight size={16} aria-hidden="true" /> : null}{value}</strong><span className="metric-note">{note}</span></div>;
}

"use client";

import Image from "next/image";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bookmark,
  ChevronDown,
  Download,
  ExternalLink,
  FileSearch,
  GitCompareArrows,
  Headphones,
  Handshake,
  LoaderCircle,
  Newspaper,
  RefreshCw,
  Search,
  Scale,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Waves,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { PreStock } from "@/lib/prestocks";
import { MarketHistory } from "@/components/market-history";
import { CatalystMonitor } from "@/components/catalyst-monitor";
import { WatchlistMonitor } from "@/components/watchlist-monitor";

type Article = { id: string; title: string; url: string; publisher: string; publishedAt: string | null; sourceCountry?: string | null; relevance?: "company_mention" | "company_publisher" | "broader_context" };
type EvidencePoint = { text: string; evidenceIds: string[] };
type Seat = {
  thesis: string;
  claims: { text: string; evidenceIds: string[] }[];
  agreements: EvidencePoint[];
  disagreements: EvidencePoint[];
  uncertainties: string[];
  confidence: "low" | "medium" | "high";
  falsifiers: string[];
};
type DebateRole = "bull" | "bear" | "neutral" | "council";
type Debate = { bull?: Seat; bear?: Seat; neutral?: Seat; council?: Seat; models: Partial<Record<DebateRole, string>>; generatedAt?: string };
type DebateNode = { id: "evidence" | DebateRole; status: "waiting" | "running" | "complete" };

const companyDomainBySymbol: Record<string, string> = {
  ANDURIL: "anduril.com",
  ANTHROPIC: "anthropic.com",
  FIGUREAI: "figure.ai",
  KALSHI: "kalshi.com",
  NEURALINK: "neuralink.com",
  OPENAI: "openai.com",
  POLYMARKET: "polymarket.com",
  SPACEX: "spacex.com",
};

const issuerNotices: Record<string, string> = {
  SPACEX: "PreStocks says SpaceX has gone public. It says holders must swap this token to SPCXx or another token by 11:59pm UTC on March 12, 2027, or it expires worthless.",
};

function companyLogoSources(asset: PreStock) {
  const domain = companyDomainBySymbol[asset.symbol];
  const companySiteFavicon = domain ? `https://${domain}/favicon.ico` : null;
  const companyFavicon = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : null;
  return [companySiteFavicon, companyFavicon, asset.image].filter((source): source is string => Boolean(source));
}

function PreStocksWordmark() {
  const [failed, setFailed] = useState(false);
  return failed
    ? <span className="prestocks-wordmark-fallback">PRESTOCKS</span>
    : <Image className="prestocks-wordmark" src="https://prestocks.com/ui/brand-logos/prestocks-logo.svg" alt="PreStocks" width={84} height={20} unoptimized referrerPolicy="no-referrer" onError={() => setFailed(true)} />;
}

function SolanaPill() {
  const [failed, setFailed] = useState(false);
  return <span className="network-pill">{!failed && <Image src="https://solana.com/src/img/branding/solanaLogoMark.svg" alt="" width={18} height={18} loading="eager" unoptimized onError={() => setFailed(true)} />}<span>Solana</span></span>;
}

function CompanyLogo({ asset, compact = false }: { asset: PreStock; compact?: boolean }) {
  const sources = companyLogoSources(asset);
  const [failedSources, setFailedSources] = useState<string[]>([]);
  const source = sources.find((candidate) => !failedSources.includes(candidate));
  const image = source
    ? <Image src={source} alt="" width={compact ? 22 : 42} height={compact ? 22 : 42} loading={compact ? "lazy" : "eager"} unoptimized onError={() => setFailedSources((previous) => [...previous, source])} />
    : <span aria-hidden="true">{asset.symbol.slice(0, 1)}</span>;
  return compact
    ? <span className="watch-avatar">{image}</span>
    : <div className={`company-avatar ${source ? "has-logo" : ""}`}>{image}</div>;
}

function ConfidenceSignal({ value }: { value: Seat["confidence"] }) {
  const levels = ["low", "medium", "high"] as const;
  const active = levels.indexOf(value);
  return <span className="confidence-signal" aria-label={`${value} confidence`}>
    <span className="confidence-track" aria-hidden="true">{levels.map((level, index) => <i className={index <= active ? `confidence-level confidence-${value}` : "confidence-level"} key={level} />)}</span>
    <span>{value} confidence</span>
  </span>;
}

function SharedEvidence({ articles }: { articles: Article[] }) {
  return <div className="shared-evidence">
    <div className="shared-evidence-title"><span className="eyebrow">SAME SOURCES</span><span>All three analysts use the same company-linked headlines</span></div>
    <div className="shared-evidence-list">{articles.slice(0, 4).map((article, index) => <a className="evidence-chip" href={article.url} target="_blank" rel="noreferrer" key={article.id} title={article.title}><span className="evidence-id">E{index + 1}</span><span className="evidence-source">{article.publisher}</span><span className="evidence-date">{timeLabel(article.publishedAt)}</span></a>)}{articles.length > 4 && <a className="evidence-more" href="#catalyst-monitor">+{articles.length - 4} more</a>}</div>
  </div>;
}

function CitationLinks({ ids, articles }: { ids: string[]; articles: Article[] }) {
  const refs = ids.map((id) => articles.find((article) => article.id === id)).filter((article): article is Article => Boolean(article));
  return refs.length > 0
    ? <span className="editor-citations">{refs.map((article) => <a className="citation" href={article.url} target="_blank" rel="noreferrer" key={article.id}>{article.publisher}<span aria-hidden="true"> ↗</span></a>)}</span>
    : <span className="unverified"><ShieldCheck size={13} aria-hidden="true" />No headline linked</span>;
}

function SeatView({ title, kind, seat, articles }: { title: string; kind: "bull" | "bear"; seat: Seat; articles: Article[] }) {
  const Icon = kind === "bull" ? TrendingUp : ShieldAlert;
  return (
    <article className={`seat-card seat-card-${kind}`}>
      <header className="seat-topline"><span className={`seat-icon seat-icon-${kind}`}><Icon size={17} aria-hidden="true" /></span><div className="seat-title-group"><span className="eyebrow">{title}</span><span className="seat-subtitle">{kind === "bull" ? "The upside case" : "The risk case"}</span></div><ConfidenceSignal value={seat.confidence} /></header>
      <p className="seat-thesis">{seat.thesis}</p>
      <div className="claims-list"><div className="claims-heading"><span>MAIN POINTS</span><span>{seat.claims.length}</span></div>
        {seat.claims.map((claim, index) => {
          const refs = claim.evidenceIds.map((id) => articles.find((article) => article.id === id)).filter((article): article is Article => Boolean(article));
          return <div className="claim" key={`${kind}-${index}`}>
            <span className="claim-number">{String(index + 1).padStart(2, "0")}</span><p>{claim.text}</p>
            {refs.length > 0
              ? <div className="citation-row">{refs.map((article) => <a className="citation" key={article.id} href={article.url} target="_blank" rel="noreferrer" title={article.title}><span>{article.publisher}</span><span aria-hidden="true"> ↗</span></a>)}</div>
              : <span className="unverified"><ShieldCheck size={13} aria-hidden="true" />No headline linked</span>}
          </div>;
        })}
      </div>
      {seat.uncertainties.length > 0 && <div className="seat-footnote"><span className="eyebrow">STILL UNKNOWN</span><p>{seat.uncertainties[0]}</p></div>}
      {seat.falsifiers.length > 0 && <div className="seat-footnote seat-falsifier"><span className="eyebrow">WHAT COULD CHANGE THIS VIEW</span><p>{seat.falsifiers[0]}</p></div>}
    </article>
  );
}

function CouncilPodcast({ seat, company }: { seat: Seat; company: string }) {
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [error, setError] = useState("");
  useEffect(() => () => { if (audioUrl) URL.revokeObjectURL(audioUrl); }, [audioUrl]);

  const turns = [
    { speaker: "host", text: `Welcome to the Vestra research brief. Today we're looking at ${company}.` },
    { speaker: "analyst", text: `Here is the Council's read: ${seat.thesis}` },
    ...(seat.agreements[0] ? [{ speaker: "host", text: `The strongest point of agreement is this: ${seat.agreements[0].text}` }] : []),
    ...(seat.disagreements[0] ? [{ speaker: "analyst", text: `The key difference in interpretation is this: ${seat.disagreements[0].text}` }] : []),
    ...(seat.uncertainties[0] ? [{ speaker: "host", text: `What remains unknown: ${seat.uncertainties[0]}` }] : []),
    ...(seat.falsifiers[0] ? [{ speaker: "analyst", text: `Evidence that could change the Council's view: ${seat.falsifiers[0]}` }] : []),
    { speaker: "host", text: "That was the Vestra research brief. It summarizes available information and is not investment advice." },
  ];

  async function createAudio() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/podcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, turns }),
      });
      if (!response.ok) {
        const result = await response.json() as { error?: string };
        throw new Error(result.error || "Could not create the audio brief.");
      }
      setAudioUrl(URL.createObjectURL(await response.blob()));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not create the audio brief.");
    } finally {
      setLoading(false);
    }
  }

  return <div className="council-podcast">
    <div className="council-podcast-copy"><span className="podcast-icon"><Headphones size={17} aria-hidden="true" /></span><div><strong>Listen to the Council</strong><span>A short, two voice audio brief based on this readout.</span></div></div>
    {!audioUrl ? <button className="podcast-button" type="button" onClick={createAudio} disabled={loading}>
      {loading ? <LoaderCircle size={15} className="spin" aria-hidden="true" /> : <Headphones size={15} aria-hidden="true" />}{loading ? "Making brief…" : "Create audio brief"}
    </button> : <div className="podcast-player"><audio controls preload="metadata" src={audioUrl}>Audio playback is not supported by this browser.</audio><a className="podcast-download" href={audioUrl} download={`vestra-${company.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-brief.wav`} aria-label="Download audio brief"><Download size={15} aria-hidden="true" /></a><button className="podcast-regenerate" type="button" onClick={createAudio} disabled={loading}>{loading ? "Making…" : "Regenerate"}</button></div>}
    {error && <p className="podcast-error" role="alert">{error}</p>}
    <span className="podcast-note">Generated only when requested · Gemini 3.8 Flash-Lite TTS</span>
  </div>;
}

function EditorSynthesis({ seat, articles, company }: { seat: Seat; articles: Article[]; company: string }) {
  return <section className="editor-synthesis" aria-label="Council research synthesis">
    <div className="editor-heading"><span className="editor-icon"><Scale size={18} aria-hidden="true" /></span><div><span className="eyebrow">COUNCIL READOUT</span><strong>What the evidence supports — and what remains uncertain</strong></div><ConfidenceSignal value={seat.confidence} /></div>
    <p className="editor-thesis">{seat.thesis}</p>
    <CouncilPodcast seat={seat} company={company} />
    <div className="editor-comparison">
      <div className="editor-point editor-agreement"><span className="editor-point-title"><Handshake size={15} aria-hidden="true" />AGREEMENT</span>{seat.agreements.length ? <ul>{seat.agreements.map((item, index) => <li key={index}><span>{item.text}</span><CitationLinks ids={item.evidenceIds} articles={articles} /></li>)}</ul> : <p>No clear agreement in these headlines.</p>}</div>
      <div className="editor-point editor-disagreement"><span className="editor-point-title"><GitCompareArrows size={15} aria-hidden="true" />DISAGREEMENT</span>{seat.disagreements.length ? <ul>{seat.disagreements.map((item, index) => <li key={index}><span>{item.text}</span><CitationLinks ids={item.evidenceIds} articles={articles} /></li>)}</ul> : <p>No clear disagreement in these headlines.</p>}</div>
      <div className="editor-point editor-unknowns"><span className="editor-point-title"><span className="editor-question">?</span>STILL UNKNOWN</span>{seat.uncertainties.length ? <ul>{seat.uncertainties.slice(0, 2).map((item, index) => <li key={index}>{item}</li>)}</ul> : <p>Nothing else flagged.</p>}</div>
    </div>
    {seat.claims.length > 0 && <div className="editor-evidence"><span className="eyebrow">COUNCIL’S POINTS</span>{seat.claims.slice(0, 2).map((claim, index) => {
      const refs = claim.evidenceIds.map((id) => articles.find((article) => article.id === id)).filter((article): article is Article => Boolean(article));
      return <div className="editor-evidence-row" key={index}><p>{claim.text}</p>{refs.length > 0 && <div className="citation-row">{refs.map((article) => <a className="citation" href={article.url} target="_blank" rel="noreferrer" key={article.id}>{article.publisher}<span aria-hidden="true"> ↗</span></a>)}</div>}</div>;
    })}</div>}
    {seat.falsifiers.length > 0 && <div className="editor-falsifier"><span className="eyebrow">WHAT COULD CHANGE THE VIEW</span><p>{seat.falsifiers[0]}</p></div>}
  </section>;
}

function DebateFlow({ nodes }: { nodes: DebateNode[] }) {
  const labels: Record<DebateNode["id"], string> = { evidence: "Sources", bull: "Bull", bear: "Bear", neutral: "Neutral", council: "Council" };
  const node = (id: DebateNode["id"]) => nodes.find((item) => item.id === id)?.status ?? "waiting";
  return <div className="debate-flow" aria-label="Live debate progress" aria-live="polite">
    <div className={`flow-node flow-source ${node("evidence")}`}><span className="flow-node-dot">1</span><strong>{labels.evidence}</strong><small>{node("evidence") === "complete" ? "Ready" : "Waiting"}</small></div>
    <span className={`flow-wire ${node("evidence") === "complete" ? "complete" : ""}`} aria-hidden="true" />
    <div className="flow-analysts">{(["bull", "bear", "neutral"] as const).map((id, index) => <div className={`flow-node flow-${id} ${node(id)}`} key={id}><span className="flow-node-dot">{index + 2}</span><strong>{labels[id]}</strong><small>{node(id) === "complete" ? "Ready" : node(id) === "running" ? "Reading…" : "Queued"}</small></div>)}</div>
    <span className={`flow-wire ${node("council") !== "waiting" ? "complete" : ""}`} aria-hidden="true" />
    <div className={`flow-node flow-council ${node("council")}`}><span className="flow-node-dot">5</span><strong>{labels.council}</strong><small>{node("council") === "complete" ? "Readout ready" : node("council") === "running" ? "Weighing views…" : "Next"}</small></div>
  </div>;
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

function getServerWatchlistSnapshot() {
  return false;
}

function timeLabel(value: string | null) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC", timeZoneName: "short" }).format(date);
}

type ResearchView = "research" | "replay";

export function ResearchDesk({ assets, fetchedAt, error, initialView, initialSymbol }: { assets: PreStock[]; fetchedAt: string; error: string | null; initialView: ResearchView; initialSymbol: string }) {
  const initial = useMemo(() => assets.find((asset) => asset.symbol === initialSymbol) ?? assets[0], [assets, initialSymbol]);
  const [symbol, setSymbol] = useState(initial?.symbol ?? "");
  const view = initialView;
  const asset = assets.find((item) => item.symbol === symbol) ?? initial;
  const [articles, setArticles] = useState<Article[]>([]);
  const [newsState, setNewsState] = useState<"loading" | "ready" | "empty" | "error">("loading");
  const [newsError, setNewsError] = useState("");
  const [debate, setDebate] = useState<Debate | null>(null);
  const [debateSources, setDebateSources] = useState<Article[]>([]);
  const [debateNodes, setDebateNodes] = useState<DebateNode[]>([
    { id: "evidence", status: "waiting" }, { id: "bull", status: "waiting" }, { id: "bear", status: "waiting" },
    { id: "neutral", status: "waiting" }, { id: "council", status: "waiting" },
  ]);
  const [debateError, setDebateError] = useState("");
  const [debateLoading, setDebateLoading] = useState(false);
  const assetSymbol = asset?.symbol;
  const assetName = asset?.name;
  const companyPickerRef = useRef<HTMLSelectElement>(null);
  const newsAbortRef = useRef<AbortController | null>(null);
  const debateAbortRef = useRef<AbortController | null>(null);
  const debateSequenceRef = useRef(0);
  const symbolRef = useRef(symbol);
  const subscribeSaved = useCallback((onChange: () => void) => {
    window.addEventListener("storage", onChange);
    window.addEventListener("vestra-watchlist-change", onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener("vestra-watchlist-change", onChange);
    };
  }, []);
  const getSavedSnapshot = useCallback(() => {
    try {
      return Boolean(asset && window.localStorage.getItem(`vestra:watch:${asset.symbol}`) === "true");
    } catch {
      return false;
    }
  }, [asset]);
  const saved = useSyncExternalStore(subscribeSaved, getSavedSnapshot, getServerWatchlistSnapshot);
  const getSavedSymbolsSnapshot = useCallback(() => {
    try {
      return assets.filter((item) => window.localStorage.getItem(`vestra:watch:${item.symbol}`) === "true").map((item) => item.symbol).join(",");
    } catch {
      return "";
    }
  }, [assets]);
  const savedSymbols = useSyncExternalStore(subscribeSaved, getSavedSymbolsSnapshot, () => "");
  const savedAssets = useMemo(() => savedSymbols ? savedSymbols.split(",").map((savedSymbol) => assets.find((item) => item.symbol === savedSymbol)).filter((item): item is PreStock => Boolean(item)) : [], [savedSymbols, assets]);

  const loadNews = useCallback(async () => {
    if (!assetSymbol || !assetName) return;
    newsAbortRef.current?.abort();
    debateAbortRef.current?.abort();
    debateAbortRef.current = null;
    const controller = new AbortController();
    newsAbortRef.current = controller;
    let timedOut = false;
    const deadline = window.setTimeout(() => { timedOut = true; controller.abort(); }, 12_000);
    debateSequenceRef.current += 1;
    setNewsState("loading");
    setNewsError("");
    setArticles([]);
    setDebateLoading(false);
    setDebate(null);
    setDebateSources([]);
    setDebateError("");
    try {
      const company = assetName.replace(/\s+PreStocks$/i, "");
      const response = await fetch(`/api/news?company=${encodeURIComponent(company)}&symbol=${encodeURIComponent(assetSymbol)}`, { signal: controller.signal });
      const payload = await response.json() as { articles?: Article[]; error?: string };
      if (controller.signal.aborted) return;
      if (!response.ok) throw new Error(payload.error || "Could not load company news.");
      const nextArticles = payload.articles ?? [];
      setArticles(nextArticles);
      setNewsState(nextArticles.length ? "ready" : "empty");
    } catch (reason) {
      if (controller.signal.aborted && !timedOut) return;
      setArticles([]);
      setNewsState("error");
      setNewsError(timedOut ? "Company coverage took too long. Try refreshing." : reason instanceof Error ? reason.message : "Could not load company news.");
    } finally {
      window.clearTimeout(deadline);
      if (newsAbortRef.current === controller) newsAbortRef.current = null;
    }
  }, [assetName, assetSymbol]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadNews(); }, 0);
    return () => {
      window.clearTimeout(timer);
      newsAbortRef.current?.abort();
      debateAbortRef.current?.abort();
    };
  }, [loadNews]);

  const premium = asset?.tokenPrice !== null && asset?.markPrice !== null && asset?.markPrice !== undefined && asset.markPrice !== 0
    ? ((asset.tokenPrice! / asset.markPrice) - 1) * 100
    : null;
  const debateEvidence = debateSources.length ? debateSources : articles.filter((article) => article.relevance !== "broader_context");

  async function runDebate() {
    if (!asset) return;
    const requestId = ++debateSequenceRef.current;
    const requestSymbol = asset.symbol;
    const controller = new AbortController();
    debateAbortRef.current?.abort();
    debateAbortRef.current = controller;
    const deadline = window.setTimeout(() => {
      controller.abort();
      if (requestId !== debateSequenceRef.current) return;
      debateSequenceRef.current += 1;
      setDebateLoading(false);
      setDebateError("The research room took too long to answer. Wait a moment, then try again.");
    }, 50_000);
    setDebateLoading(true);
    setDebateError("");
    setDebate(null);
    setDebateSources([]);
    setDebateNodes([{ id: "evidence", status: "running" }, { id: "bull", status: "waiting" }, { id: "bear", status: "waiting" }, { id: "neutral", status: "waiting" }, { id: "council", status: "waiting" }]);
    try {
      const response = await fetch("/api/debate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: asset.name,
        }),
        signal: controller.signal,
      });
      if (!response.ok) {
        const payload = await response.json() as { error?: string };
        throw new Error(payload.error || "Could not start the debate.");
      }
      if (!response.body) throw new Error("This browser could not receive the live debate.");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let doneReceived = false;
      while (true) {
        const { value, done } = await reader.read();
        buffer += decoder.decode(value, { stream: !done });
        const frames = buffer.split("\n\n");
        buffer = frames.pop() ?? "";
        for (const frame of frames) {
          const line = frame.split("\n").find((item) => item.startsWith("data: "));
          if (!line) continue;
          const event = JSON.parse(line.slice(6)) as { type: string; id?: DebateNode["id"]; status?: DebateNode["status"]; seat?: Seat; model?: string; generatedAt?: string; error?: string; articles?: Article[] };
          if (requestId !== debateSequenceRef.current || requestSymbol !== symbolRef.current) return;
          if (event.type === "evidence" && event.articles) {
            setDebateSources(event.articles);
          } else if (event.type === "node" && event.id && event.status) {
            setDebateNodes((previous) => previous.map((item) => item.id === event.id ? { ...item, status: event.status! } : item));
          } else if (event.type === "result" && event.id && event.seat) {
            const id = event.id as DebateRole;
            setDebate((previous) => ({ ...(previous ?? { models: {} }), [id]: event.seat, models: { ...(previous?.models ?? {}), [id]: event.model ?? "Unknown" } }));
          } else if (event.type === "done") {
            doneReceived = true;
            setDebate((previous) => previous ? { ...previous, generatedAt: event.generatedAt } : previous);
          } else if (event.type === "error") throw new Error(event.error || "The debate did not finish.");
        }
        if (done) break;
      }
      if (!doneReceived) throw new Error("The live debate ended before the council readout was ready. Try again.");
    } catch (reason) {
      if (requestId !== debateSequenceRef.current || requestSymbol !== symbolRef.current) return;
      const timedOut = reason instanceof Error && (reason.name === "TimeoutError" || reason.name === "AbortError");
      setDebateError(timedOut ? "The debate took too long. Wait a moment, then try again." : reason instanceof Error ? reason.message : "Could not start the debate.");
    } finally {
      window.clearTimeout(deadline);
      if (debateAbortRef.current === controller) debateAbortRef.current = null;
      if (requestId === debateSequenceRef.current) setDebateLoading(false);
    }
  }

  function toggleSavedCompany() {
    if (!asset) return;
    const next = !saved;
    try {
      window.localStorage.setItem(`vestra:watch:${asset.symbol}`, String(next));
      window.dispatchEvent(new Event("vestra-watchlist-change"));
    } catch {
      return;
    }
  }

  function chooseCompany(nextSymbol: string) {
    symbolRef.current = nextSymbol;
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("asset", nextSymbol);
    window.history.replaceState(null, "", `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
    setSymbol(nextSymbol);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
          <a className="brand-lockup" href={`/?view=research&asset=${encodeURIComponent(symbol)}`} aria-label="Vestra home"><Image className="brand-mark-image" src="/images/vestra-mark-v12.png" alt="" width={38} height={38} priority /><span>vestra</span></a>
        <div className="workspace-label">PRESTOCKS</div>
        <nav className="side-nav" aria-label="Main navigation">
          <a className={`nav-item ${view === "research" ? "active" : ""}`} href={`/?view=research&asset=${encodeURIComponent(symbol)}`} aria-current={view === "research" ? "page" : undefined}><Newspaper size={17} aria-hidden="true" />Research</a>
          <a className={`nav-item ${view === "replay" ? "active" : ""}`} href={`/?view=replay&asset=${encodeURIComponent(symbol)}`} aria-current={view === "replay" ? "page" : undefined}><Waves size={17} aria-hidden="true" />Market replay</a>
        </nav>
        <section className={`saved-companies ${savedAssets.length ? "has-saved" : "empty"}`} aria-label="Saved companies">
          <div className="saved-companies-heading">Saved companies</div>
          {savedAssets.length ? savedAssets.map((item) => <a className={`watch-item ${item.symbol === symbol ? "selected" : ""}`} href={`/?view=research&asset=${encodeURIComponent(item.symbol)}`} aria-current={item.symbol === symbol ? "page" : undefined} key={item.symbol}><CompanyLogo asset={item} compact /><span>{item.name.replace(/\s+PreStocks$/i, "")}</span><span className="watch-dot" aria-hidden="true" /></a>) : <p className="saved-companies-empty">Save a company to pin it here.</p>}
        </section>
        <WatchlistMonitor assets={savedAssets} />
        <div className="sidebar-spacer" />
        <a className="sidebar-source" href="https://prestocks.com/products" target="_blank" rel="noreferrer"><span>DATA SOURCE</span><strong>PreStocks catalogue <ExternalLink size={12} aria-hidden="true" /></strong></a>
      </aside>

      <main className="main-area" id="top">
        <header className="topbar"><div className="crumb"><span>Vestra</span><span className="crumb-slash">/</span><strong>{view === "research" ? "Research" : "Market replay"}</strong></div><div className="top-actions"><SolanaPill /><button type="button" className="icon-button" aria-label="Choose a company" onClick={() => companyPickerRef.current?.focus()}><Search size={17} aria-hidden="true" /></button><button type="button" className={`icon-button ${saved ? "saved" : ""}`} aria-label={saved ? `Remove ${asset?.name.replace(" PreStocks", "") ?? "company"} from your watchlist` : `Save ${asset?.name.replace(" PreStocks", "") ?? "company"} to your watchlist`} aria-pressed={saved} onClick={toggleSavedCompany}><Bookmark size={17} aria-hidden="true" fill={saved ? "currentColor" : "none"} /></button></div></header>

        <div className="content-wrap">
        <section className="page-heading" id="desk"><div><div className="overline"><span className="live-dot" /><PreStocksWordmark /><span className="overline-divider" aria-hidden="true">·</span><span>{view === "research" ? "RESEARCH" : "MARKET REPLAY"}</span></div><h1>{view === "research" ? "Research" : "Market replay"}</h1><p>{view === "research" ? "PreStocks tokens give price exposure, not company ownership." : "Review the selected token’s Solana pool; its price may differ from PreStocks."}</p></div><div className="heading-actions">{view === "research" ? <span className="updated-label"><RefreshCw size={13} aria-hidden="true" />Updated {timeLabel(fetchedAt)}</span> : <span className="updated-label">Pool data · GeckoTerminal</span>}</div></section>

          {!asset ? <section className="empty-panel" role="status"><FileSearch size={24} aria-hidden="true" /><h2>PreStocks data is unavailable</h2><p>{error ?? "Try refreshing to load the current company catalogue."}</p><a className="outline-button as-link" href="https://prestocks.com/products" target="_blank" rel="noreferrer">View PreStocks <ExternalLink size={14} aria-hidden="true" /></a></section> : <>
            <section className="company-banner">
              <div className="company-info"><CompanyLogo asset={asset} /><div><span className="company-category">PRESTOCKS LISTING</span><div className="company-title-row"><h2>{asset.name.replace(" PreStocks", "")}</h2><span className="ticker-badge">{asset.symbol}</span></div></div></div>
              <div className="company-picker-wrap"><label htmlFor="company-select">Company</label><select ref={companyPickerRef} id="company-select" value={asset.symbol} onChange={(event) => chooseCompany(event.target.value)}>{assets.map((item) => <option value={item.symbol} key={item.symbol}>{item.name.replace(" PreStocks", "")}</option>)}</select><ChevronDown size={15} aria-hidden="true" /></div>
            </section>

            {view === "research" && <section className="metric-strip" aria-label="PreStocks market snapshot">
              <Metric label="Token price" value={money(asset.tokenPrice)} note="PreStocks quote" accent />
              <Metric label="Reference price" value={money(asset.markPrice)} note="PreStocks estimate" />
              <Metric label="Quote vs. reference" value={premium === null ? "—" : `${premium > 0 ? "+" : ""}${premium.toFixed(2)}%`} note={premium === null ? "No comparison available" : premium > 0 ? "Above reference" : premium < 0 ? "Below reference" : "At reference"} semantic={premium === null ? undefined : premium > 0 ? "positive" : premium < 0 ? "negative" : undefined} />
              <Metric label="Estimated value" value={compactMoney(asset.impliedValuation)} note="At the token price" />
              <div className="metric-source"><span className="source-check"><ShieldCheck size={14} aria-hidden="true" /></span><div><strong>Source: PreStocks</strong><span>Fetched <time>{new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(new Date(fetchedAt))}</time></span></div></div>
            </section>}
            {issuerNotices[asset.symbol] && <div className="inline-alert issuer-notice" role="note">{issuerNotices[asset.symbol]} <a href="https://prestocks.com/spacex" target="_blank" rel="noreferrer">Open PreStocks notice <ExternalLink size={12} aria-hidden="true" /></a></div>}
            {error && <div className="inline-alert" role="status">Showing no cached company data. {error}</div>}

            {view === "research" ? <>
            <CatalystMonitor key={asset.mint} asset={asset} articles={articles} newsState={newsState} newsError={newsError} onRefresh={() => void loadNews()} />

            <section className="panel debate-panel" id="debate" aria-busy={debateLoading}>
              <div className="debate-heading"><div><span className="eyebrow">THREE VIEWS · ONE READOUT</span><h3>The debate room</h3><p>Bull, Bear and Neutral review the same headlines. The Council weighs their cases.</p></div><button className="primary-button" type="button" onClick={() => void runDebate()} disabled={debateLoading || newsState !== "ready" || articles.length === 0}>{debateLoading ? <><LoaderCircle className="spin" size={16} aria-hidden="true" />Debate in progress…</> : <><GitCompareArrows size={16} aria-hidden="true" />Start debate</>}</button></div>
              <DebateFlow nodes={debateNodes} />
              {debateError && <div className="inline-alert debate-error" role="alert"><span>{debateError}</span><button type="button" onClick={() => void runDebate()} disabled={debateLoading}>Try again</button></div>}
              {debate ? <div className="debate-results"><SharedEvidence articles={debateEvidence} /><div className="debate-faceoff"><div>{debate.bull ? <SeatView title="Bull analyst" kind="bull" seat={debate.bull} articles={debateEvidence} /> : <div className="seat-pending">Bull analyst is weighing the upside…</div>}{debate.neutral && <article className="neutral-card"><span className="eyebrow">NEUTRAL VIEW</span><p>{debate.neutral.thesis}</p><ConfidenceSignal value={debate.neutral.confidence} /></article>}</div><div className="debate-versus" aria-hidden="true"><span>VS</span></div><div>{debate.bear ? <SeatView title="Bear analyst" kind="bear" seat={debate.bear} articles={debateEvidence} /> : <div className="seat-pending">Bear analyst is weighing the risks…</div>}</div></div>{debate.council ? <EditorSynthesis seat={debate.council} articles={debateEvidence} company={asset.name.replace(/\s+PreStocks$/i, "")} /> : <div className="seat-pending council-pending">The Council is comparing all three views…</div>}<div className="debate-disclosure">Bull: {debate.models.bull ?? "pending"} · Bear: {debate.models.bear ?? "pending"} · Neutral: {debate.models.neutral ?? "pending"} · Council: {debate.models.council ?? "pending"}{debate.generatedAt ? ` · ${timeLabel(debate.generatedAt)}` : ""}. Company-specific headlines and market snapshot only; not a buy/sell call.</div></div> : <div className="debate-preview" aria-live="polite">
                <div className="preview-sides"><div className="preview-side preview-bull"><span className="preview-icon"><TrendingUp size={18} aria-hidden="true" /></span><div><span className="eyebrow">BULL ANALYST</span><strong>Show the upside case</strong></div><span className="preview-wait">{newsState === "ready" ? "Ready" : "Waiting for headlines"}</span></div><div className="preview-divider"><span>AGAINST</span></div><div className="preview-side preview-bear"><span className="preview-icon"><ShieldAlert size={18} aria-hidden="true" /></span><div><span className="eyebrow">BEAR ANALYST</span><strong>Show risks in the same headlines</strong></div><span className="preview-wait">{newsState === "ready" ? "Ready" : "Waiting for headlines"}</span></div></div>
                <div className="preview-editor"><span className="editor-icon"><Scale size={17} aria-hidden="true" /></span><div><strong>Council readout</strong><span>Compares the three views, evidence, and what could change the read.</span></div><span className="model-note">Four AI roles</span></div>
              </div>}
              <div className="debate-bottom"><span><ShieldCheck size={14} aria-hidden="true" />Headlines linked to sources</span><span>Not investment advice</span></div>
            </section>
            </> : <>
              <section className="panel market-panel replay-market-panel" id="market">
                <div className="panel-heading"><div><span className="eyebrow">PRESTOCKS PRICES</span><h3>Quote vs. reference</h3></div><span className="panel-icon"><Waves size={16} aria-hidden="true" /></span></div>
                <div className="price-comparison"><div><span className="eyebrow">TOKEN PRICE</span><strong>{money(asset.tokenPrice)}</strong><span className="price-caption">PreStocks quote</span></div><div className="comparison-arrow" aria-hidden="true">↔</div><div><span className="eyebrow">REFERENCE PRICE</span><strong>{money(asset.markPrice)}</strong><span className="price-caption">PreStocks estimate</span></div></div>
                <div className="premium-gap" role="note">{premium === null ? "Reference gap unavailable" : <><strong>{premium > 0 ? "+" : ""}{premium.toFixed(2)}%</strong><span>{premium > 0 ? "above" : premium < 0 ? "below" : "at"} reference</span></>}</div>
                <div className="market-quote-asof">PreStocks quote fetched {timeLabel(fetchedAt)}</div>
                <div className="market-details"><div><span>Tokens in circulation</span><strong>{shortNumber(asset.supply)}</strong></div><div><span>Value at reference price</span><strong>{compactMoney(asset.markValuation)}</strong></div><div><span>Token address</span><a href={`https://explorer.solana.com/address/${asset.mint}`} target="_blank" rel="noreferrer">{asset.mint.slice(5, 9)}…{asset.mint.slice(-5)} <ExternalLink size={12} aria-hidden="true" /></a></div></div>
              </section>
              <MarketHistory key={asset.mint} mint={asset.mint} ticker={asset.symbol} tokenPrice={asset.tokenPrice} articles={articles} />
            </>}

            <footer className="page-footer"><span>Vestra is independent and is not affiliated with the companies shown.</span><a href="https://prestocks.com/products" target="_blank" rel="noreferrer">PreStocks tokens provide economic exposure only. Review product risks <ExternalLink size={12} aria-hidden="true" /></a></footer>
          </>}
        </div>
      </main>
    </div>
  );
}

function Metric({ label, value, note, accent = false, semantic }: { label: string; value: string; note: string; accent?: boolean; semantic?: "positive" | "negative" }) {
  return <div className="metric-cell"><span className="eyebrow">{label}</span><strong className={`${accent ? "accent-value" : ""} ${semantic ?? ""}`}>{semantic === "positive" ? <ArrowUpRight size={16} aria-hidden="true" /> : semantic === "negative" ? <ArrowDownRight size={16} aria-hidden="true" /> : null}{value}</strong><span className="metric-note">{note}</span></div>;
}

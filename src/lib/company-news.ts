import { classifyHeadline, type HeadlineRelevance } from "@/lib/news-relevance";

export type CompanyHeadline = { id: string; title: string; publisher: string; publishedAt: string | null; url: string; relevance: HeadlineRelevance };

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
}

function readTag(block: string, tag: string): string {
  const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeXml(match[1]) : "";
}

function normalizeDate(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function parseGoogleNews(xml: string, maxRecords: number, company: string, symbol: string): CompanyHeadline[] {
  const items = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)];
  const seen = new Set<string>();
  const companyName = company.replace(/\s+PreStocks$/i, "").trim().toLocaleLowerCase();
  return items.flatMap(([_, block], index): CompanyHeadline[] => {
    const sourceMatch = block.match(/<source\b[^>]*>([\s\S]*?)<\/source>/i);
    const publisher = sourceMatch ? decodeXml(sourceMatch[1]) : "Publisher";
    const title = readTag(block, "title").replace(new RegExp(`\\s[-–—]\\s${publisher.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}$`, "i"), "").trim().slice(0, 240);
    const url = readTag(block, "link");
    const publishedAt = normalizeDate(readTag(block, "pubDate"));
    if (!title || title.toLocaleLowerCase() === companyName || !url.startsWith("https://")) return [];
    const canonicalTitle = `${publisher.toLocaleLowerCase()}|${title.toLocaleLowerCase()}`;
    if (seen.has(canonicalTitle)) return [];
    seen.add(canonicalTitle);
    return [{ id: `n${index + 1}`, title, publisher: publisher.slice(0, 100), publishedAt, url, relevance: classifyHeadline(company, symbol, title, publisher) }];
  }).sort((a, b) => Date.parse(b.publishedAt ?? "1970-01-01T00:00:00.000Z") - Date.parse(a.publishedAt ?? "1970-01-01T00:00:00.000Z")).slice(0, maxRecords)
    .map((article, index) => ({ ...article, id: `n${index + 1}` }));
}

export async function getCompanyNews(company: string, symbol: string, maxRecords = 12): Promise<CompanyHeadline[]> {
  const safeCompany = company.replace(/\s+PreStocks$/i, "").trim().slice(0, 100);
  if (!safeCompany) throw new Error("A company name is required.");
  const endpoint = new URL("https://news.google.com/rss/search");
  endpoint.searchParams.set("q", `"${safeCompany.replace(/["\\]/g, "")}" when:7d`);
  endpoint.searchParams.set("hl", "en-US");
  endpoint.searchParams.set("gl", "US");
  endpoint.searchParams.set("ceid", "US:en");
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error("Company news provider timed out"));
    }, 8_000);
  });
  try {
    // Race the complete response body read, not only response headers: an RSS
    // host can accept a connection and then stall while streaming its body.
    return await Promise.race([
      (async () => {
        const response = await fetch(endpoint, { next: { revalidate: 300 }, signal: controller.signal, headers: { Accept: "application/rss+xml, application/xml, text/xml" } });
        if (!response.ok) throw new Error(`News provider returned HTTP ${response.status}`);
        const xml = await response.text();
        if (new TextEncoder().encode(xml).byteLength > 2_000_000) throw new Error("Google News response exceeded the size limit");
        return parseGoogleNews(xml, Math.min(20, Math.max(1, maxRecords)), safeCompany, symbol);
      })(),
      deadline,
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

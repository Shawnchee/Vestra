import { NextResponse } from "next/server";

export const revalidate = 300;

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function readTag(block: string, tag: string): string {
  const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeXml(match[1]) : "";
}

function topicFromUrl(url: string): string {
  const section = new URL(url).pathname.split("/").filter(Boolean)[0]?.toLowerCase();
  const labels: Record<string, string> = {
    markets: "Markets",
    business: "Industry",
    policy: "Policy",
    tech: "Technology",
    technology: "Technology",
    web3: "Web3",
    finance: "Finance",
    culture: "Culture",
  };
  return (section && labels[section]) || "Crypto";
}

function parseFeed(xml: string) {
  const seen = new Set<string>();
  return [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].flatMap(([, block]) => {
    const title = readTag(block, "title").slice(0, 240);
    const url = readTag(block, "link");
    const publishedAt = new Date(readTag(block, "pubDate"));
    const description = readTag(block, "description");
    const author = readTag(block, "dc:creator").slice(0, 100);
    if (!title || !url.startsWith("https://www.coindesk.com/") || !Number.isFinite(publishedAt.getTime()) || seen.has(url)) return [];
    seen.add(url);
    return [{
      id: url,
      title,
      url,
      topic: topicFromUrl(url),
      author,
      summary: description.slice(0, 300),
      publishedAt: publishedAt.toISOString(),
    }];
  }).sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).slice(0, 6);
}

export async function GET() {
  try {
    const response = await fetch("https://www.coindesk.com/arc/outboundfeeds/rss", {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(9000),
      headers: { Accept: "application/rss+xml, application/xml, text/xml" },
    });
    if (!response.ok) throw new Error(`CoinDesk RSS returned ${response.status}`);
    const xml = await response.text();
    if (xml.length > 2_000_000) throw new Error("CoinDesk RSS response exceeded the size limit");
    const stories = parseFeed(xml);
    if (!stories.length) throw new Error("CoinDesk RSS contained no usable stories");
    return NextResponse.json({ stories, fetchedAt: new Date().toISOString(), provider: "CoinDesk RSS" });
  } catch {
    return NextResponse.json({ stories: [], error: "Crypto market coverage is temporarily unavailable. Try again shortly.", provider: "CoinDesk RSS" }, { status: 502 });
  }
}

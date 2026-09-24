import { NextResponse } from "next/server";

export const revalidate = 300;

function normalizeDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const match = value.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/);
  const date = match
    ? new Date(`${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}Z`)
    : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const company = url.searchParams.get("company")?.trim().slice(0, 100);
  if (!company) return NextResponse.json({ articles: [], error: "Choose a company to search." }, { status: 400 });

  const maxRecords = Math.min(20, Math.max(1, Number(process.env.NEWS_MAX_RECORDS) || 12));
  const endpoint = new URL("https://api.gdeltproject.org/api/v2/doc/doc");
  endpoint.searchParams.set("query", `\"${company.replace(/[\"\\]/g, "")}\"`);
  endpoint.searchParams.set("mode", "artlist");
  endpoint.searchParams.set("format", "json");
  endpoint.searchParams.set("sort", "datedesc");
  endpoint.searchParams.set("timespan", "7d");
  endpoint.searchParams.set("maxrecords", String(maxRecords));

  try {
    const response = await fetch(endpoint, { next: { revalidate: 300 }, signal: AbortSignal.timeout(8000), headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`News provider returned HTTP ${response.status}`);
    const payload = await response.json() as { articles?: unknown };
    const rows = Array.isArray(payload.articles) ? payload.articles : [];
    const articles = rows.flatMap((raw, index) => {
      if (!raw || typeof raw !== "object") return [];
      const row = raw as Record<string, unknown>;
      const title = typeof row.title === "string" ? row.title.trim().slice(0, 240) : "";
      const articleUrl = typeof row.url === "string" ? row.url : "";
      if (!title || !articleUrl.startsWith("https://")) return [];
      return [{
        id: `n${index + 1}`,
        title,
        url: articleUrl,
        publisher: typeof row.domain === "string" ? row.domain : "Source",
        publishedAt: normalizeDate(row.seendate),
        sourceCountry: typeof row.sourcecountry === "string" ? row.sourcecountry : null,
      }];
    });
    return NextResponse.json({ articles, fetchedAt: new Date().toISOString(), provider: "GDELT" });
  } catch {
    return NextResponse.json({ articles: [], error: "News is temporarily unavailable. Try again shortly." }, { status: 502 });
  }
}

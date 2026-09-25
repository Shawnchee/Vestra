import { NextResponse } from "next/server";
import { getCompanyNews } from "@/lib/company-news";

export const revalidate = 300;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const company = url.searchParams.get("company")?.trim().slice(0, 100);
  const symbol = url.searchParams.get("symbol")?.trim().slice(0, 30) ?? "";
  if (!company) return NextResponse.json({ articles: [], error: "Choose a company to search." }, { status: 400 });
  const maxRecords = Math.min(20, Math.max(1, Number(process.env.NEWS_MAX_RECORDS) || 12));
  try {
    const articles = await getCompanyNews(company, symbol, maxRecords);
    const relevantCount = articles.filter((article) => article.relevance !== "broader_context").length;
    return NextResponse.json({ articles, fetchedAt: new Date().toISOString(), provider: "Google News", companyRelevantCount: relevantCount });
  } catch {
    return NextResponse.json({ articles: [], error: "News is temporarily unavailable. Try again shortly." }, { status: 502 });
  }
}

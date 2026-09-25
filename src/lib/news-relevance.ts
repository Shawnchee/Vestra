export type HeadlineRelevance = "company_mention" | "company_publisher" | "broader_context";

const aliases: Record<string, string[]> = {
  ANTHROPIC: ["Anthropic", "Claude"],
  OPENAI: ["OpenAI", "ChatGPT"],
  FIGUREAI: ["Figure AI"],
  ANDURIL: ["Anduril"],
  KALSHI: ["Kalshi"],
  NEURALINK: ["Neuralink"],
  POLYMARKET: ["Polymarket"],
  SPACEX: ["SpaceX"],
};

function containsPhrase(text: string, phrase: string): boolean {
  const escaped = phrase.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return escaped.length > 0 && new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}([^\\p{L}\\p{N}]|$)`, "iu").test(text);
}

export function classifyHeadline(company: string, symbol: string, title: string, publisher: string): HeadlineRelevance {
  const knownAliases = aliases[symbol.toUpperCase()] ?? [];
  const candidates = [company.replace(/\s+PreStocks$/i, "").trim(), ...knownAliases].filter(Boolean);
  if (candidates.some((candidate) => containsPhrase(title, candidate))) return "company_mention";
  if (candidates.some((candidate) => containsPhrase(publisher, candidate))) return "company_publisher";
  return "broader_context";
}

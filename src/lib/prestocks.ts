export type PreStock = {
  name: string;
  symbol: string;
  description: string;
  image?: string;
  externalUrl?: string;
  mint: string;
  markPrice: number | null;
  tokenPrice: number | null;
  markValuation: number | null;
  impliedValuation: number | null;
  supply: number | null;
};

const numberOrNull = (value: unknown): number | null => {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : null;
};

export function parsePreStocks(input: unknown): PreStock[] {
  if (!Array.isArray(input)) return [];

  return input.flatMap((item): PreStock[] => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const name = typeof row.name === "string" ? row.name : "";
    const symbol = typeof row.symbol === "string" ? row.symbol : "";
    const mint = typeof row.contract_address === "string" ? row.contract_address : "";
    if (!name || !symbol || !mint) return [];

    return [{
      name,
      symbol,
      description: typeof row.description === "string" ? row.description : "",
      image: typeof row.image === "string" ? row.image : undefined,
      externalUrl: typeof row.external_url === "string" ? row.external_url : undefined,
      mint,
      markPrice: numberOrNull(row.markPrice),
      tokenPrice: numberOrNull(row.tokenPrice),
      markValuation: numberOrNull(row.markValuation),
      impliedValuation: numberOrNull(row.impliedValuation),
      supply: numberOrNull(row.supply),
    }];
  });
}

export async function getPreStocks(): Promise<{ assets: PreStock[]; fetchedAt: string; error: string | null }> {
  try {
    const response = await fetch("https://prestocks.com/api/prestocks", {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`PreStocks returned HTTP ${response.status}`);
    const raw = await response.text();
    if (new TextEncoder().encode(raw).byteLength > 2_000_000) throw new Error("PreStocks response exceeded the size limit");
    const assets = parsePreStocks(JSON.parse(raw));
    if (!assets.length) throw new Error("PreStocks returned no valid assets");
    return { assets, fetchedAt: new Date().toISOString(), error: null };
  } catch {
    return { assets: [], fetchedAt: new Date().toISOString(), error: "PreStocks data is temporarily unavailable." };
  }
}

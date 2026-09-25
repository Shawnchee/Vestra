export type MarketQualityInput = {
  tokenPrice: number | null;
  markPrice: number | null;
  liquidityUsd: number;
  volume24hUsd: number;
  latestClose: number | null;
  latestCandleTime: number | null;
  fetchedAt: string;
};

export function analyzeMarketQuality(input: MarketQualityInput) {
  const quoteGapPercent = input.latestClose !== null && input.tokenPrice !== null && input.tokenPrice > 0
    ? (input.latestClose / input.tokenPrice - 1) * 100
    : null;
  const markGapPercent = input.tokenPrice !== null && input.markPrice !== null && input.markPrice > 0
    ? (input.tokenPrice / input.markPrice - 1) * 100
    : null;
  const fetchedAtSeconds = Date.parse(input.fetchedAt) / 1000;
  const candleAgeDays = input.latestCandleTime !== null && Number.isFinite(fetchedAtSeconds)
    ? (fetchedAtSeconds - input.latestCandleTime) / 86_400
    : null;
  const flags = [
    ...(quoteGapPercent !== null && Math.abs(quoteGapPercent) > 20 ? ["Pool close differs from the PreStocks quote by more than 20%"] : []),
    ...(markGapPercent !== null && Math.abs(markGapPercent) > 20 ? ["PreStocks quote differs from its reference mark by more than 20%"] : []),
    ...(input.liquidityUsd < 10_000 ? ["Pool liquidity is below $10,000"] : []),
    ...(input.volume24hUsd < 1_000 ? ["Less than $1,000 traded in the pool in 24 hours"] : []),
    ...(candleAgeDays !== null && candleAgeDays > 2 ? ["Latest completed daily close is over two days old"] : []),
  ];
  const label = flags.length >= 2 ? "Weak market read" : flags.length === 1 ? "Use with care" : "No major data flags";
  return { quoteGapPercent, markGapPercent, candleAgeDays, flags, label };
}

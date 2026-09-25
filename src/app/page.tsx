import { ResearchDesk } from "@/components/research-desk";
import { getPreStocks } from "@/lib/prestocks";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ view?: string; asset?: string | string[] }> }) {
  const { view, asset: requestedAsset } = await searchParams;
  const result = await getPreStocks();
  const initialView = view === "replay" ? "replay" : "research";
  const requestedSymbol = Array.isArray(requestedAsset) ? requestedAsset[0] : requestedAsset;
  const initialSymbol = result.assets.some((asset) => asset.symbol === requestedSymbol)
    ? requestedSymbol!
    : result.assets.find((asset) => asset.symbol === "ANTHROPIC")?.symbol
      ?? result.assets.find((asset) => asset.symbol === "SPACEX")?.symbol
      ?? result.assets[0]?.symbol
      ?? "";
  if (result.assets.length && requestedSymbol && requestedSymbol !== initialSymbol && initialSymbol) {
    const canonicalParams = new URLSearchParams();
    if (initialView === "replay") canonicalParams.set("view", "replay");
    canonicalParams.set("asset", initialSymbol);
    redirect(`/?${canonicalParams.toString()}`);
  }
  return <ResearchDesk key={`${initialView}:${initialSymbol}`} {...result} initialView={initialView} initialSymbol={initialSymbol} />;
}

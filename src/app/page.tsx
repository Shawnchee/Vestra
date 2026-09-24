import { ResearchDesk } from "@/components/research-desk";
import { getPreStocks } from "@/lib/prestocks";

export const dynamic = "force-dynamic";

export default async function Home() {
  const result = await getPreStocks();
  return <ResearchDesk {...result} />;
}

import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const maxDuration = 60;

type Evidence = { id: string; title: string; publisher: string; publishedAt: string | null; url: string };
type Seat = {
  thesis: string;
  claims: { text: string; evidenceIds: string[] }[];
  uncertainties: string[];
  confidence: "low" | "medium" | "high";
  falsifiers: string[];
};

function validateSeat(value: unknown, evidenceIds: Set<string>): Seat {
  if (!value || typeof value !== "object") throw new Error("Invalid model response");
  const row = value as Record<string, unknown>;
  const claims = Array.isArray(row.claims) ? row.claims : [];
  const uncertainties = Array.isArray(row.uncertainties) ? row.uncertainties : [];
  const falsifiers = Array.isArray(row.falsifiers) ? row.falsifiers : [];
  const confidence = row.confidence === "low" || row.confidence === "high" ? row.confidence : "medium";
  return {
    thesis: typeof row.thesis === "string" ? row.thesis.slice(0, 600) : "The model did not provide a thesis.",
    claims: claims.flatMap((claim): Seat["claims"] => {
      if (!claim || typeof claim !== "object") return [];
      const item = claim as Record<string, unknown>;
      if (typeof item.text !== "string") return [];
      const ids = Array.isArray(item.evidenceIds)
        ? item.evidenceIds.filter((id): id is string => typeof id === "string" && evidenceIds.has(id))
        : [];
      return [{ text: item.text.slice(0, 400), evidenceIds: ids }];
    }).slice(0, 5),
    uncertainties: uncertainties.filter((item): item is string => typeof item === "string").slice(0, 5),
    confidence,
    falsifiers: falsifiers.filter((item): item is string => typeof item === "string").slice(0, 4),
  };
}

async function ask(ai: GoogleGenAI, model: string, role: string, company: string, evidence: Evidence[], market: unknown, extra = ""): Promise<Seat> {
  const prompt = `You are the ${role} in an evidence-led private-company research room. Analyze ${company}.\n\nRules:\n- Use only the evidence packet and market snapshot below. Do not add outside facts.\n- Headlines are metadata, not article text; do not infer details that are not in a headline.\n- Every factual claim must cite one or more evidence IDs from the packet. If there is no supporting item, put it in uncertainties and do not state it as fact.\n- This is research, not financial advice. Never issue a buy/sell instruction or predict a guaranteed return.\n- Return JSON only with this shape: {"thesis":"...","claims":[{"text":"...","evidenceIds":["n1"]}],"uncertainties":["..."],"confidence":"low|medium|high","falsifiers":["..."]}.\n\n${extra}\nEVIDENCE PACKET:\n${JSON.stringify(evidence)}\n\nMARKET SNAPSHOT:\n${JSON.stringify(market)}`;
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: { responseMimeType: "application/json", maxOutputTokens: 900 },
  });
  const text = response.text;
  if (!text) throw new Error("Empty model response");
  return validateSeat(JSON.parse(text), new Set(evidence.map((item) => item.id)));
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Add GEMINI_API_KEY to .env.local to enable the research room.", code: "MISSING_KEY" }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const company = typeof body.company === "string" ? body.company.slice(0, 100) : "";
  const market = body.market && typeof body.market === "object" ? body.market : {};
  const evidence = Array.isArray(body.evidence) ? body.evidence.flatMap((raw, index): Evidence[] => {
    if (!raw || typeof raw !== "object") return [];
    const row = raw as Record<string, unknown>;
    if (typeof row.title !== "string" || typeof row.url !== "string" || !row.url.startsWith("https://")) return [];
    return [{
      id: `n${index + 1}`,
      title: row.title.slice(0, 240),
      publisher: typeof row.publisher === "string" ? row.publisher.slice(0, 100) : "Source",
      publishedAt: typeof row.publishedAt === "string" ? row.publishedAt.slice(0, 40) : null,
      url: row.url,
    }];
  }).slice(0, 10) : [];

  if (!company || !evidence.length) {
    return NextResponse.json({ error: "Choose a company and load at least one source before starting a debate." }, { status: 400 });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = process.env.GEMINI_MODEL || "gemini-3.7-flash";
    const [bull, bear] = await Promise.all([
      ask(ai, model, "bull analyst", company, evidence, market, "Present the strongest reasonable positive interpretation and challenge your own weakest assumption."),
      ask(ai, model, "bear analyst", company, evidence, market, "Present the strongest reasonable risk-focused interpretation and acknowledge evidence that complicates your case."),
    ]);
    const editor = await ask(
      ai,
      model,
      "neutral editor",
      company,
      evidence,
      market,
      `Compare these prior cases. Do not treat either as verified fact.\nBULL CASE: ${JSON.stringify(bull)}\nBEAR CASE: ${JSON.stringify(bear)}\nSynthesize areas of agreement, contested interpretation, key unknowns, and what future evidence would change the picture.`,
    );
    return NextResponse.json({ bull, bear, editor, model, generatedAt: new Date().toISOString() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const limited = /429|quota|rate.?limit|resource_exhausted/i.test(message);
    return NextResponse.json(
      { error: limited ? "Gemini free-tier quota is temporarily exhausted. Check AI Studio limits and try again later." : "The research room could not complete this debate. Check the model setting and try again.", code: limited ? "RATE_LIMITED" : "MODEL_ERROR" },
      { status: limited ? 429 : 502 },
    );
  }
}

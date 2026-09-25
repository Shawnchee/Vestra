import { NextResponse } from "next/server";

export const maxDuration = 60;

type Turn = { speaker: "host" | "analyst"; text: string };

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0].trim();
    const host = forwardedHost || request.headers.get("host") || new URL(request.url).host;
    const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0].trim();
    const protocol = forwardedProtocol || new URL(request.url).protocol.replace(":", "");
    const parsed = new URL(origin);
    return parsed.host.toLowerCase() === host.toLowerCase() && parsed.protocol === `${protocol}:`;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "This request must come from Vestra." }, { status: 403 });
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > 8_192) return NextResponse.json({ error: "This audio brief is too long." }, { status: 413 });
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Audio briefs need GEMINI_API_KEY configured on the server." }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > 8_192) return NextResponse.json({ error: "This audio brief is too long." }, { status: 413 });
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid audio brief request." }, { status: 400 });
  }
  const company = typeof body.company === "string" ? body.company.trim().slice(0, 100) : "";
  const turns = Array.isArray(body.turns) ? body.turns as unknown[] : [];
  if (!company || turns.length < 2 || turns.length > 8 || turns.some((turn) =>
    !turn || typeof turn !== "object" ||
    !["host", "analyst"].includes((turn as Record<string, unknown>).speaker as string) ||
    typeof (turn as Record<string, unknown>).text !== "string" ||
    !(turn as Record<string, string>).text.trim() ||
    (turn as Record<string, string>).text.length > 700
  )) return NextResponse.json({ error: "The council transcript is invalid." }, { status: 400 });

  try {
    const apiKeys = [...new Set([apiKey, process.env.GEMINI_FALLBACK_API_KEY?.trim()].filter((key): key is string => Boolean(key)))];
    const payload = JSON.stringify({
        model: process.env.GEMINI_TTS_MODEL?.trim() || "gemini-3.8-flash-lite-tts",
        input: [{ type: "user_input", content: turns.map((turn) => {
          const item = turn as Turn;
          return {
            type: "text",
            text: item.text.trim(),
            annotations: [{ type: "speech_metadata", speaker: item.speaker === "host" ? "Maya" : "Alex", style: "calm, clear financial research podcast" }],
          };
        }) }],
        response_format: { type: "audio" },
        generation_config: { speech_config: {
          mode: "conversational",
          speakers: [{ speaker: "Maya", voice: "Kore" }, { speaker: "Alex", voice: "Puck" }],
        } },
      });
    let response: Response | undefined;
    for (const key of apiKeys) {
      response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: payload,
        signal: AbortSignal.timeout(45_000),
        cache: "no-store",
      });
      if (response.ok || apiKeys.at(-1) === key || (response.status !== 429 && response.status < 500)) break;
      console.warn("Gemini audio request unavailable; retrying with the secondary credential.");
    }
    if (!response) return NextResponse.json({ error: "Could not create the audio brief. Try again shortly." }, { status: 503 });
    if (!response.ok) {
      const info = await response.text();
      console.error("Gemini podcast TTS failed", JSON.stringify({ status: response.status }));
      const limited = response.status === 429 || /quota|resource_exhausted|rate.?limit/i.test(info);
      return NextResponse.json({ error: limited ? "Gemini audio quota is temporarily exhausted. Try again later." : "Could not create the audio brief. Try again shortly." }, { status: limited ? 429 : response.status >= 500 ? 503 : 502 });
    }
    const interaction = await response.json() as {
      output_audio?: { data?: string };
      steps?: { content?: { type?: string; data?: string }[] }[];
    };
    const audioBase64 = interaction.output_audio?.data ?? interaction.steps?.flatMap((step) => step.content ?? []).find((item) => item.type === "audio")?.data;
    if (!audioBase64) return NextResponse.json({ error: "Gemini returned no audio for this brief." }, { status: 502 });
    const audio = Buffer.from(audioBase64, "base64");
    return new NextResponse(new Uint8Array(audio), {
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": String(audio.byteLength),
        "Cache-Control": "no-store",
        "Content-Disposition": `attachment; filename="vestra-${company.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-brief.wav"`,
      },
    });
  } catch (error) {
    const limited = error instanceof Error && /429|quota|resource_exhausted|rate.?limit/i.test(error.message);
    return NextResponse.json({ error: limited ? "Gemini audio quota is temporarily exhausted. Try again later." : "Audio generation timed out or failed. Try again shortly." }, { status: limited ? 429 : 504 });
  }
}

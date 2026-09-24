# Vestra

**Evidence-led company research for tokenized private markets on Solana.**

Vestra brings PreStocks market context, company news, and a multi-perspective AI research room into one place. The bull and bear cases use the same source packet; an editor summarizes where they agree, what remains uncertain, and what evidence could change each view.

## Project status

This repository is being prepared for the Stocklana hackathon. See [PRD.md](./PRD.md) for the complete product requirements and [CHECKLIST.md](./CHECKLIST.md) for the build and submission checklist.

## Target

- **Hackathon:** Stocklana, Solana
- **Tracks:** Main track and PreStocks Best Use of PreStocks
- **PreStocks bounty:** $10,000 pool across three awards
- **Eligibility:** the PreStocks bounty excludes projects integrating non-PreStocks pre-IPO tokens. Vestra therefore sources its supported assets from the PreStocks API only.

## Integrations

- **PreStocks:** `https://prestocks.com/api/prestocks` for the live catalogue, token/mark prices, valuations, supply, and Solana mint addresses.
- **News:** GDELT DOC API for company-news discovery, with source URLs and publication times retained.
- **AI:** Google Gemini Developer API using the official `@google/genai` SDK. The server-side key is configured later through `GEMINI_API_KEY`; it must never be exposed in client code.
- **Historical market data:** only use trades/candles verified for the selected PreStocks mint. The PreStocks catalogue is not an OHLC API. Dukascopy FX series are not valid stock-token backtest data.

## Local setup

1. Install Node.js 20.9 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` (a blank local template is already present in this checkout).
4. Add a Gemini API key from Google AI Studio to `GEMINI_API_KEY` when available. Do not commit `.env.local` or paste the key into chat.
5. Run `npm run dev` to start the development server. Use `npm run build` for a production build and `npm start` to serve it.

The interface and data screens remain useful without a Gemini key: show live PreStocks data and news, and present a clear key-not-configured state for the debate action. Gemini’s free tier has model-specific quotas and Google can change availability; check the active limits in AI Studio before a live demo. Google's current pricing page says free-tier prompts may be used to improve its products, so Vestra only sends public headlines and public market snapshots to Gemini; never send private user information.

## Product principles

- Source every factual claim. AI-generated claims without valid evidence links are marked unverified.
- Separate reported facts, analysis, and unknowns.
- Show observation time, source, units, and data gaps beside market values.
- Never present analysis as a guaranteed outcome or a personalized buy/sell recommendation.
- Do not fabricate historical data or backtest returns.

## References

- [Stocklana](https://hackathons.solana.com/hackathons/stocklana)
- [PreStocks API](https://prestocks.com/api/prestocks)
- [PreStocks products and disclosures](https://prestocks.com/products)
- [Gemini API pricing and free tier](https://ai.google.dev/gemini-api/docs/pricing)
- [Gemini API rate limits](https://ai.google.dev/gemini-api/docs/rate-limits)
- [Google GenAI SDK](https://ai.google.dev/gemini-api/docs/libraries)

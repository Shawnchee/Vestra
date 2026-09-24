# Vestra — Product Requirements Document

**Status:** Build specification
**Version:** 1.0
**Hackathon:** Stocklana
**Primary track:** Main track
**Cash bounty target:** PreStocks Best Use of PreStocks

## 1. Product summary

Vestra is an evidence-led research workstation for PreStocks. It combines current PreStocks token and reference-mark data, relevant company news, and a multi-perspective AI debate. Instead of returning a single opaque “AI sentiment” score, Vestra gives the user a source-linked bull case, bear case, and neutral editor synthesis, then places those views beside observed token-market context.

## 2. Problem

Research on private companies is fragmented across news outlets and token-market pages. A reader has to decide whether a headline is material, how strong the counterargument is, and whether the token market is trading at a premium or discount to its reference mark. AI summaries often hide their sources and uncertainty.

## 3. Target users

- **Curious PreStocks holder:** wants a fast, inspectable briefing before researching further.
- **Active on-chain researcher:** wants market context, source-linked events, and competing interpretations in one workspace.
- **Hackathon judge/demo viewer:** needs to understand the PreStocks integration and complete a useful flow in a few minutes.

## 4. Product promise

**One company. Competing cases. Every factual claim tied to evidence.**

Vestra supports research, not trading execution. It does not tell users what to buy or sell.

## 5. Hackathon fit and constraints

Stocklana’s PreStocks bounty invites research, discovery, analysis, AI agents, simulations, and other uses that drive value for PreStocks. The listed bounty is $10,000 total across three awards. Any non-PreStocks pre-IPO token integration makes a project ineligible for that bounty. All company-token choices in Vestra must therefore come from PreStocks’ own catalogue.

Stocklana judging also looks for a real user/problem, a working end-to-end demo, a reason the product belongs on Solana, and execution quality. Vestra’s on-chain market context and the PreStocks-issued Solana mints are central to its flow.

## 6. Core user journey

1. Open the research desk and see a selected PreStocks company, its token price, reference mark, premium/discount, implied valuation, and freshness.
2. Change company using the PreStocks catalogue selector.
3. Review company news with publisher, publication time, source link, and why the item matched.
4. Start a debate. Vestra gathers a bounded shared packet of news and market facts.
5. Read three distinct roles:
   - **Bull analyst:** strongest positive case supported by source IDs.
   - **Bear analyst:** strongest countercase, risks, and missing evidence.
   - **Editor:** points of agreement, contested claims, unknowns, confidence, and falsifiers.
6. Select citations to jump to their source cards; open originals in a new tab.
7. Review historical token movement or an event window only when timestamped history for the exact PreStocks mint has been validated. Otherwise show a clearly labeled event timeline and current market snapshot without inventing returns.

## 7. Functional requirements

### 7.1 PreStocks catalogue and market panel

- Fetch `https://prestocks.com/api/prestocks` server-side where practical.
- Parse and validate each returned record before rendering.
- Include asset name/symbol, logo if available, contract address, token price, mark price, premium/discount, implied/mark valuation, supply, source, and last fetched time.
- Derive premium/discount from the same response values; handle zero, null, stale, and malformed values without crashing.
- Provide loading skeleton, empty state, API error state, and retry action.
- Clearly attribute PreStocks and link to its product page.
- Do not represent a PreStocks token as ownership in the underlying company. Surface relevant product disclosures in the information panel.

### 7.2 News discovery

- Search recent coverage for a company name and configured aliases using GDELT DOC API.
- Deduplicate by canonical URL/title and filter obvious name collisions.
- Keep headline, publisher/domain, published time, URL, and query/match context.
- Bound result count and query window; cache to avoid needless external requests.
- Clearly distinguish article metadata from model interpretation. Link every card to the source.
- Display a helpful no-results state and do not fabricate articles.

### 7.3 Multi-agent debate with Gemini

- Use Google’s official `@google/genai` SDK on the server only.
- Read `GEMINI_API_KEY` and optional `GEMINI_MODEL` from server environment variables.
- Default to a currently free-tier text model only after verifying model access in AI Studio; model name must be configurable.
- Submit the same limited evidence packet and market snapshot to the bull and bear role prompts.
- Run editor synthesis after both cases so it can compare them explicitly.
- Request structured output: thesis, claims, evidence IDs, counterpoints, uncertainties, confidence, and falsifiers.
- Validate returned evidence IDs against the provided packet. Mark unsupported claims unverified; never invent source links.
- Handle missing key, quota/rate limit, timeout, malformed model output, and provider errors with user-visible recovery messages.
- Add reasonable request size and response size limits; avoid sending private keys or wallet secrets to the model.
- Do not persist Gemini keys, complete prompts, or user secrets in browser storage or logs.

### 7.4 Historical context / backtesting

- GeckoTerminal's public API exposes exact-mint Solana pool discovery and OHLCV endpoints; a live SpaceX PreStocks/USDC pool returned daily candles. Its public API is beta and rate-limited.
- The latest observed close from that pool was about five times the PreStocks catalogue's current token quote. This likely reflects a unit/supply/market-data inconsistency, but its cause is not confirmed.
- Investigate and reconcile actual on-chain swap/trade history for the selected PreStocks mint against PreStocks' catalogue price before enabling charts or strategy results.
- Validate token decimals, quote asset, timestamps, missing intervals, liquidity, and history depth before charting.
- Only label a result “backtest” when it uses a documented, reproducible rule over verified historical observations and states date range, sample size, fees/slippage, and benchmark.
- Do not use Dukascopy FX or another unrelated asset series as a proxy.
- Until prices reconcile, present the live token-vs-mark comparison plus sourced event timeline, explain the limitation, and avoid simulated precision.

### 7.5 Responsive interface and accessibility

- Desktop-first research workstation with a clear, compact navigation rail, company identity/market summary, dominant chart/event area, and evidence/debate workspace.
- At small viewports, collapse navigation and stack or tab the work areas without clipping critical data.
- All actions use semantic buttons/links, keyboard navigation, visible focus, and at least 40px touch targets.
- Respect reduced-motion preference. Use restrained transitions for panel, selection, and load states only.
- Maintain accessible contrast; use color plus text/icon for positive/negative values.

## 8. Visual direction

Create an original Vestra identity using familiar patterns from successful crypto products: a quiet application shell, legible asset selector, strong price/chart hierarchy, compact market metadata, clear active states, and fast-feeling panels. Take broad interaction and information-hierarchy cues from products such as Jupiter, Birdeye, and Phantom. Do not copy their logos, exact layouts, proprietary illustrations, names, or brand palettes.

**Proposed palette:** deep graphite surfaces, soft neutral text, restrained mint as the Vestra action color, and semantic green/red reserved for market movement.
**Type:** crisp sans for UI; tabular/monospaced numerals for prices and addresses.
**Density:** comfortable by default, with data-rich chart and quote sections.
**Generated artwork:** an original imagegen-created atmospheric header/background asset that complements the market desk and does not compete with data.

## 9. Data and privacy

- Keep API keys server-only, in `.env.local` locally and platform environment settings in deployment.
- Commit `.env.example`, never real credentials.
- Do not send wallet addresses or private wallet material to Gemini; Vestra has no wallet connection in the initial hackathon experience.
- Respect source provider terms and rate limits; link to originals rather than republishing full article text.
- Use clear source/freshness labels and explain stale data.
- Be explicit that free-tier data may be subject to provider terms and usage limits.

## 10. Non-goals for the hackathon build

- Executing trades, connecting a wallet, or managing portfolio funds.
- Automated trading signals, promised returns, or personalized financial advice.
- Claiming comprehensive private-company news coverage.
- Using unrelated FX data to stand in for PreStocks token history.
- Integrating any non-PreStocks pre-IPO token in the bounty submission.

## 11. Success criteria

- A first-time viewer can identify the selected PreStocks company and understand token price versus mark price.
- A user can load real company news, run the bull/bear/editor flow when a Gemini key is configured, and follow citations to source cards and originals.
- All data is visibly sourced and timestamped; errors and missing history are honest and recoverable.
- At least one selected PreStocks mint has verified usable history before a backtest is shown.
- App works in desktop and mobile layouts and can be demoed from a fresh session.
- A README, checklist, screenshot/video path, and submission copy are ready before the deadline.

## 12. Technical direction

- **Web:** Next.js App Router + TypeScript.
- **UI:** Tailwind CSS, shadcn/ui primitives where useful, Lucide icons, CSS transitions.
- **AI:** official `@google/genai` SDK, server route/actions only.
- **Charts:** choose an actively maintained chart library compatible with license and required interaction; never imply proprietary LuxAlgo signals unless explicitly licensed and integrated.
- **Data flow:** PreStocks catalogue → validated domain types → UI; GDELT discovery → normalized article packet → validated Gemini role outputs.
- **Secrets:** `.env.local` ignored by Git; `.env.example` contains names only.
- **Persistence:** keep initial demo data ephemeral unless persistence is needed; do not store secrets or unverified AI claims.

## 13. External references

- Stocklana: https://hackathons.solana.com/hackathons/stocklana
- PreStocks catalogue: https://prestocks.com/api/prestocks
- PreStocks products/disclosures: https://prestocks.com/products
- Gemini pricing/free tier: https://ai.google.dev/gemini-api/docs/pricing
- Gemini rate limits: https://ai.google.dev/gemini-api/docs/rate-limits
- Google GenAI SDK: https://ai.google.dev/gemini-api/docs/libraries
- GeckoTerminal public API and OHLCV reference: https://api.geckoterminal.com/docs/index.html
- GDELT DOC API: https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/

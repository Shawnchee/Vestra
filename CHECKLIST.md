# Vestra build and submission checklist

Use this as the source of truth while building. Check an item only after its result exists and has been reviewed.

## Repository and setup

- [x] Confirm `Shawnchee/Vestra` repository access and connect this workspace to it.
- [x] Initialize the app with Next.js App Router, TypeScript, and a reproducible npm lockfile.
- [x] Add `.gitignore`, `.env.example`, and a clear local setup guide.
- [x] Confirm `.env.local` and all credentials are ignored by Git.
- [x] Add a configurable free-tier Gemini model and API-key placeholder; verify actual access in AI Studio when the key arrives.
- [x] Add `PRD.md` and keep this checklist current.

## Brand and interface

- [x] Finalize Vestra palette, typography, tone, spacing, and data visualization rules in `brand.md`.
- [x] Create an original imagegen asset, move it into the repository, and reference it in the UI.
- [x] Build application shell with responsive navigation and selected-company context.
- [x] Build PreStocks selector and market snapshot: token price, mark, premium/discount, valuation, supply, mint, freshness.
- [ ] Build readable chart/event-history area with explicit source, interval, units, and missing-history state.
- [x] Build evidence list with publisher, date, source link, and empty/error states.
- [x] Build bull, bear, editor debate view with evidence citations and uncertainty labels.
- [ ] Ensure desktop, tablet, and mobile layouts have intentional navigation and panel behavior.
- [ ] Check focus states, keyboard use, touch target size, contrast, and reduced-motion support.

## Data and AI

- [x] Fetch and validate the live PreStocks catalogue.
- [x] Limit supported asset choices to PreStocks API results; include no outside pre-IPO assets.
- [x] Calculate token/mark premium with zero/null handling.
- [ ] Retrieve and normalize dated company news; de-duplicate results and preserve original links.
- [ ] Verify the news API behavior, CORS/routing needs, and rate-limit/cache strategy.
- [x] Locate a public exact-mint OHLCV candidate (GeckoTerminal) for SpaceX PreStocks.
- [ ] Reconcile GeckoTerminal’s latest price with PreStocks’ catalogue quote before charting/backtesting; observed USD values differ by about 5x.
- [ ] Validate history units, decimals, timestamps, coverage, and liquidity before chart/backtest use.
- [ ] If history is not defensible, remove backtest language and ship event timeline + live market context.
- [x] Implement Gemini API server-side with `@google/genai`; browser bundle must not contain the key.
- [x] Implement bull and bear role prompts against the same evidence packet.
- [x] Implement neutral editor synthesis after both role results.
- [x] Validate returned citation IDs and visually flag unsupported claims.
- [x] Add missing-key and rate-limit states; add invalid response and provider error recovery.
- [ ] Verify API-key configuration locally without committing or pasting the key into source/chat.

## Product finish

- [ ] Review copy for accuracy and remove trading promises or personalized buy/sell calls.
- [ ] Attribute PreStocks, news providers, and any market-history source.
- [ ] Add appropriate PreStocks economic-exposure and risk disclosures.
- [ ] Make fresh-session demo flow reliable, with seeded view state only where clearly labeled.
- [x] Add a README with install/run steps, product summary, data sources, and limitations.
- [ ] Capture polished screenshots or record a short demo video.
- [ ] Add a clear explanation of open-source components and generated/curated demo data.

## Verify before submission

- [ ] Start from a clean install and confirm the app builds and launches.
- [ ] Walk the complete asset → news → debate → evidence → market-context flow.
- [ ] Exercise loading, empty, error, and retry states.
- [ ] Check 375px, 768px, and 1280px viewports.
- [ ] Confirm there are no console errors, broken image assets, or secret values in browser/network logs.
- [ ] Confirm any chart/backtest uses the exact PreStocks mint and documents its assumptions.
- [ ] Confirm the main-track and PreStocks bounty eligibility constraints.
- [ ] Confirm submission deadline and links directly on Stocklana.
- [ ] Submit GitHub, live demo, or video before submissions close; retain edit time for the final entry.

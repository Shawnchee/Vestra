# Vestra build and submission checklist

Use this as the source of truth while building. Check an item only after its result exists and has been reviewed.

## Repository and setup

- [x] Confirm `Shawnchee/Vestra` repository access and connect this workspace to it.
- [x] Initialize the app with Next.js App Router, TypeScript, and a reproducible npm lockfile.
- [x] Add `.gitignore`, `.env.example`, and a clear local setup guide.
- [x] Confirm `.env.local` and all credentials are ignored by Git.
- [x] Add a configurable Gemini primary model, distinct bull/bear defaults, a separate fallback model, and API-key placeholder; confirm the configured key reaches Gemini. Live generation remains affected by provider-busy responses.
- [x] Add `PRD.md` and keep this checklist current.

## Brand and interface

- [x] Finalize Vestra palette, typography, tone, spacing, and data visualization rules in `brand.md`.
- [x] Create an original imagegen asset, move it into the repository, and reference it in the UI.
- [x] Create a fresh transparent Vestra mark with ImageGen and use it in the app, browser icon, and generated social-preview route; prefer company-site marks, then use live PreStocks images in the asset header and saved-company list.
- [x] Use a quiet geometric market backdrop without implying an uptrend, clearer active navigation, and distinct quote, headline, and debate panels.
- [x] Replace the plain/older backdrop with a low-contrast editorial texture generated for Vestra; use the selected V12 mark and official Solana, PreStocks, company, and publisher logos. Simplify replay/backtest labels for the demo.
- [x] Give the bull and bear debate cards distinct, restrained visual cues, and use the same latest Vestra mark in the app, browser icon, submission page, and share card.
- [x] Show the official PreStocks wordmark and Solana network mark, plus live company logos and mapped publisher favicons with fallbacks.
- [x] Replace the faint dashboard backdrop with the edge-detailed V4 Vestra texture, keep the center and data panels quiet, and preserve the V12 symbol plus official provider marks.
- [x] Spot-check the new quote-fetch and last-close timestamp labels at 375px. Both are visible, neither clips, and the document width stays 375px.
- [x] Build application shell with responsive navigation and selected-company context.
- [x] Split the long workspace into focused Research and Market replay views with shareable query URLs; keep the core demo in Research.
- [x] Build PreStocks selector and market snapshot: token price, mark, premium/discount, valuation, supply, mint, freshness.
- [x] Build LuxAlgo Vela on-chain chart with runtime pool discovery, source, interval, units, dated headline marks, and missing-history state.
- [x] Build evidence list with publisher, date, source link, and empty/error states.
- [x] Show recognizable publisher favicons on headlines when the publisher is mapped; fall back to its initial if the image is unavailable.
- [x] Build Bull, Bear, Neutral, and Council debate view with evidence citations and uncertainty labels.
- [x] Recheck Research and Market replay at 375px, 768px, and 1280px after the latest visual pass; no horizontal overflow found. The live bull/bear result stacks at tablet widths and returns to a side-by-side comparison at 1280px. The expanded strategy panel also fits at 375px, and optional replay details start collapsed to shorten the demo.
- [x] Replace the unscaled reference-price gradient with an exact signed percentage, reduce the replay quote panel’s height, and keep all three market-detail labels legible at 375px; the chart heading is visible in the initial 720px desktop view.
- [x] Add visible keyboard focus rings; use semantic controls; honor reduced-motion settings; keep primary interactive targets at least 40px high.
- [x] Audit rendered text contrast in Research and Market replay, including expanded panels; no meaningful body text fell below estimated AA thresholds (only decorative separators did). Confirm Tab reaches the Vela chart, Left/Right moves between bars, and Enter selects/deselects a headline replay event.

## Data and AI

- [x] Fetch and validate the live PreStocks catalogue.
- [x] Limit supported asset choices to PreStocks API results; include no outside pre-IPO assets.
- [x] Calculate token/mark premium with zero/null handling.
- [x] Retrieve and normalize dated company news from Google News RSS; de-duplicate headlines and preserve story links through to publishers.
- [x] Verify server-side news routing and add a five-minute cache; confirm live feed access in the local preview.
- [x] Add a separate, cached CoinDesk RSS crypto-context feed with validated links/dates, source attribution, and a boundary that excludes it from company debate evidence.
- [x] Locate public exact-mint OHLCV data (GeckoTerminal) using runtime pool discovery instead of a hardcoded pool.
- [x] Confirm the live endpoint returns usable daily USD candles for a selected PreStocks mint through runtime USDC pool discovery.
- [ ] Explain the unexplained price basis for every supported pool. Anthropic has recently been near its PreStocks quote; SpaceX was about 413% above it with $27.28 in 24-hour volume; OpenAI was about 44.5% above with $455.3K in 24-hour volume. Low volume alone does not account for all observed gaps, and the correct price basis is still unknown. The UI warns on mismatches and keeps the simulation pool-only.
- [x] Show and link PreStocks’ live SpaceX public-listing and token-conversion notice in both research views; do not pitch SpaceX as an unqualified pre-IPO listing.
- [x] Validate displayed history units (daily USD candles), timestamps, range, and pool liquidity/volume; surface the low-volume warning. Token-price comparability remains unresolved.
- [x] Add a pool-only moving-average simulation with same-pool buy-and-hold comparison, configurable execution costs, next-open execution, drawdown/trade metrics, and explicit comparability/liquidity disclosures. Results are illustrative pool returns, not PreStocks returns.
- [x] Verify that the strategy compares 5 and 20 observed daily candles over the full available pool history, chart ranges filter by calendar days, and open positions are marked at the final close without an assumed exit. The UI discloses that gaps can make observed-candle windows longer than 5/20 calendar days and shows the sample dates/count.
- [x] Recheck the live controls: 30D changed the view to 19 candles and +6.48%; 90D restored 27 candles and +50.36%. Increasing per-side cost from 0.5% to 1% changed the strategy return from -9.05% to -10.41%; restoring 0.5% returned it to -9.05%. These are volatile sample-pool readings.
- [x] Keep pool history clearly separated from the live PreStocks quote; Catalyst Replay uses same-pool closes only and disclaims causality.
- [x] Show when the PreStocks quote was fetched and the date of the last daily pool close so viewers can judge timestamp differences.
- [x] Exclude the current UTC-day candle from daily chart history, headline timing, and backtest calculations; label the latest point as the last completed close.
- [x] Implement Gemini API server-side with `@google/genai`; browser bundle must not contain the key.
- [x] Implement bull and bear role prompts against the same evidence packet.
- [x] Implement three parallel analyst views followed by a Council evidence check and synthesis.
- [x] Use distinct Gemini models for bull and bear by default, support per-role model overrides, and disclose the models used in each successful result.
- [x] Validate returned citation IDs and visually flag unsupported claims.
- [x] Add missing-key and rate-limit states; add invalid response and provider error recovery.
- [x] Add one retry per role on transient Gemini 5xx/timeout failures using the configured fallback model; quota errors do not fan out into extra requests, and successful results report the model used per role.
- [x] Verify the local Gemini API-key configuration and server-side request path without committing the key; Google currently returns HTTP 503 high demand or HTTP 504 deadline exceeded for live generation.

## Product finish

- [x] Keep the multi-agent Bull/Bear/Neutral/Council debate and add a saved-company monitor that compares the PreStocks quote with the last browser-local check, refreshes up to five assets every ten minutes while Vestra is open, shares market-quality rules with the Catalyst Monitor, and discloses that checks are not background/Telegram alerts.
- [x] Verify saved Anthropic displays a market-check row, surfaces a temporary provider failure, and recovers on manual refresh to a completed check.

- [x] Review copy for accuracy and remove trading promises or personalized buy/sell calls.
- [x] Attribute PreStocks, Google News, CoinDesk, GeckoTerminal, and LuxAlgo Vela in the interface and README.
- [x] Add a branded 1200×630 Open Graph and X preview card using the Vestra mark; verify both generated routes and page metadata locally.
- [x] Export and refresh the branded share card as a standalone 1200×630 PNG for the hackathon listing or project page.
- [x] Add PreStocks economic-exposure and product-risk disclosure link.
- [x] (Historical; removed for public hackathon demo) Add process-local debate request limits and fail-closed Upstash REST limits for production.
- [x] Remove the mandatory Upstash setup so public debate and audio work without a separate rate-limit database; monitor Gemini usage for the hackathon demo.
- [x] Verify the clean-start demo flow without seeded results: `/` opens Anthropic Research, fetches current PreStocks/news data, runs a live three-role debate, and the selected asset carries into its pool-backed Market replay view. Rechecked on September 25: all three Gemini roles returned, six headline sources were visible, the same ANTHROPIC mint carried to Market replay, and the Vela chart loaded 27 candles.
- [x] Add a README with install/run steps, product summary, data sources, and limitations.
- [x] Draft Stocklana form copy and a short demo walkthrough in `SUBMISSION.md`.
- [ ] Capture polished screenshots or record a short demo video.
- [x] Prepare a 3-minute demo script and copy-ready hackathon entry in `SUBMISSION.md` and `SUBMISSION.html`; the 216-word project description covers the user problem, product, Solana fit, implementation, and next step. Public demo/repository links are still required before entry.
- [x] Prepare a short plain-language pitch guide with a demo path, judge Q&A, and precise claims in `PITCH.md`.
- [x] Document live data sources, Gemini-generated analysis, original generated artwork, and the absence of fabricated market/demo results.

## Verify before submission

- [x] Start from a clean install and confirm the app builds and launches (`npm ci`, production build, and live local preview were verified).
- [x] Walk the asset → news → successful debate → evidence citation flow end-to-end after the sixth cited headline was made visible. A fresh three-role run succeeded after fixing same-origin routing and catalogue-name normalization (Bull/Editor: `gemini-3.5-flash-lite`; Bear fallback: `gemini-3.1-flash-lite`); `#n6` resolved to the sixth visible headline. Provider capacity was intermittent on an earlier retry.
- [x] Exercise production-built API handlers with synthetic responses for core input, empty-feed, and outage paths. All provider fetches were intercepted in-process: News empty feed (200) and outage (502); CoinDesk valid item (200), empty feed (502), and outage (502); PreStocks outage (503); unsupported mint (404); no active USDC pool (404); insufficient candles (404); GeckoTerminal outage (502); missing debate key (503), malformed JSON (400), missing evidence (400), oversized body (413), cross-origin (403); production Upstash unconfigured (503), unavailable (503), and rate-limited (429); Gemini outage after fallback (503); primary Gemini 503 followed by fallback success (200 with all three roles). Tests used synthetic credentials/data and made no external provider calls.
- [ ] Confirm empty/error/retry states in the rendered browser UI with upstreams deliberately failing and inspect recovery details. Route responses and source branches are verified, but direct local API access is restricted in the browser and shell; successful live Research/Market replay was rechecked separately.
- [x] Check 375px, 768px, and 1280px viewports for Research and Market replay; no horizontal overflow after the latest visual pass. The live bull/bear result stacks below 920px and compares side by side at 1280px. The expanded strategy panel fits at 375px, and optional replay details start collapsed.
- [x] Inspect browser console and visible image assets; no application errors or broken logos found. Latest review loaded the Vestra, official Solana, official PreStocks, Anthropic, and mapped publisher marks; no error-level console messages were returned. Earlier Next.js smooth-scroll warnings were fixed by the document attribute.
- [x] Confirm the chart and simulation use the selected exact PreStocks mint and disclose the unresolved price basis and pool-only assumptions.
- [x] Keep selected company when navigating between Research and Market replay; verified Anthropic carries into its own mint, USDC pool, and 90-day chart.
- [x] Verify changing the company selector updates the query URL in both views; refreshing the selected OpenAI replay preserves its quote, mint, OpenAI/USDC pool, and 48 daily candles.
- [x] Confirm a malformed shared asset URL redirects to the selected fallback asset, preserving the requested view and keeping the URL in sync with the displayed company.
- [x] Confirm the Main Track and PreStocks Best Use eligibility constraints directly on Stocklana.
- [x] Confirm the submission deadline directly on Stocklana: September 25, 2026 at 4:00pm ET.
- [x] Push the app code, pitch, submission materials, and supporting Markdown/HTML documents to GitHub `main` in modular commits. Repository visibility still needs confirmation before using GitHub as the judge link.
- [ ] Provide at least one judge-accessible GitHub, live demo, or video link in the Stocklana entry; confirm access and finish the form before submissions close.

## Submission-day audit — September 25, 2026

The official page was rechecked at 00:35 UTC: it was still marked LIVE, showed about 20 hours remaining, 278 submissions, and requires one accessible GitHub, live demo, or video link. Fresh Research and Market replay views loaded current PreStocks data, six Anthropic headlines, the official Solana/PreStocks marks, company marks, and the selected Figure AI USDC pool with a Vela chart. This pass fixed the Google News source footer’s misleading leading “N” badge. The open items above are still open: controlled failure-state QA, an app screenshot or short demo recording, price-basis explanation, Gemini usage monitoring, and an accessible public link/team details for the form. No external release or form action has been taken.

### Live demo smoke-check — September 25, 2026 (00:35 UTC)

- The latest pass rechecked Research selection/URL synchronization, company headlines, navigation into the same selected mint, live pool discovery, Vela chart range, the cost-sensitive backtest, CoinDesk context separation, and a dated headline replay. The selected pool/replay results and known price gap are recorded in `PROJECT_REPORT.md`.
- This does not close the controlled error/empty-state check or screenshot/video deliverable. The public-link, Upstash, and unresolved price-basis items remain open.


### Submission window check — September 25, 2026 (01:15 UTC)

- The official Stocklana page showed LIVE, 281 submissions, and about 19 hours until its September 25, 4:00pm ET deadline. It requires at least one accessible GitHub, live demo, or video link. The PreStocks Best Use bounty remains aligned because Vestra only uses the PreStocks catalogue. Recheck the deadline before submitting.
- Historical status note: at this checkpoint GitHub was private, no public demo/video existed, and production debate needed Upstash setup. See the current handoff at the end of this file.

### Brand and debate refinement — September 25, 2026 (01:34 UTC)

- Generated and wired the V11 Vestra mark; regenerated the share card from the production image renderer. Current live company/favicon, PreStocks, and official Solana logos remain separate from generated Vestra artwork.
- Added a restrained “UP”/“RISK” distinction to the debate cards and completed one live three-role Anthropic debate smoke-check. See `PROJECT_REPORT.md` for the detailed notes. `npm run lint` and `npm run build` pass.
- Shortened pool, backtest, and headline-replay wording while retaining the calculation steps and limitations. A subagent made this copy-only pass.

### Submission form recheck — September 25, 2026 (01:41 UTC)

- Historical checkpoint: earlier page checks showed about 19 hours remaining. Recheck the official event page for the current status. The form needs the team's account details, an invited teammate list if applicable, and one accessible project link.

### PreStocks product status — September 25, 2026 (01:49 UTC)

- Reviewed the current PreStocks API/product field names and SpaceX listing. Added a linked lifecycle notice to both Vestra views for SPACEX. Browser QA confirmed the notice is visible on Research and Market replay; lint/build pass. SpaceX will not be described as a current pre-IPO company in the demo script.
- The pool-to-catalogue price basis is still unresolved. Official PreStocks API and product pages expose separate token, mark, and valuation fields, but do not document how each discovered third-party pool reconciles to them; Vestra labels the comparison and warns rather than inventing a conversion.

### Visual and deadline recheck — September 25, 2026 (02:03 UTC)

- Replaced the previous faint backdrop with `public/images/vestra-market-atmosphere-v4.webp`, generated for Vestra and compressed to 117 KB. Confirmed it renders in a temporary local preview with the official Solana and PreStocks marks, Anthropic’s mapped favicon, live company headlines, and readable data panels. Kept V11 as the active Vestra mark after exploring a busier alternate.
- Official Stocklana page: LIVE, 286 submissions, about 18 hours left, deadline September 25 at 4:00pm ET. Submit page still requires a signed-in account and wallet. Remaining submission blockers: a judge-accessible GitHub/demo/video link, final team details, production Upstash settings, screenshots or video, and browser-visible failure-state review. See `SUBMISSION.md` for the handoff checklist.
- Functional recheck at 02:09 UTC confirmed the six-headline Research view, exact mint carried into matching USDC pool replay, 27 completed Vela candles, the 69-price sample strategy, separate CoinDesk stories, and honest “no later completed close” handling for a Sep 24 headline.
- Built-route QA at 02:23 UTC exercised mocked empty and failure responses across News, CoinDesk, PreStocks, GeckoTerminal, Upstash, and Gemini. The primary-model outage retried configured fallbacks and succeeded with all three roles; a full Gemini outage returned the expected retryable 503. No live provider calls or valid external AI requests were made.
- The official event and submit pages were rechecked at 02:23 UTC: still LIVE, 286 submissions, about 18 hours left, and sign-in plus wallet connection required before the form.

### Submission package audit — September 25, 2026 (02:47 UTC)

- Rewrote the entry description in `SUBMISSION.md` and `SUBMISSION.html` as a 216-word scan-friendly explanation of the user problem, product flow, exact-mint Solana rationale, implementation, known data limitations, and next step. The README social card uses the V12 logo and was rendered from the current Open Graph image route.
- Corrected `DEPLOYMENT.md`: `main` is 39 commits ahead of `origin/main`, has additional uncommitted changes, and has not been pushed. The host project remains unlinked; no deployment or public visibility change was made.
- Still outstanding at that historical checkpoint: judge-accessible GitHub/demo/video URL, final team/wallet choices, a recorded app walkthrough, rendered browser verification of forced provider-error states, and an explanation for the pool-versus-PreStocks price basis. Do not describe the entry as submitted or deployed.

### Final pitch and readiness review — September 25, 2026 (03:14 UTC)

- [x] Add a short pitch, demo route, judge Q&A, and claim guardrails in `PITCH.md`; link it from the README and project report.
- [x] Re-run `npm run lint`, `npm run build`, and `git diff --check`; all pass on the current local checkout.
- [x] Scan reachable Git history diffs for Google, AWS, GitHub, Stripe, and Slack key formats and private-key blocks; none matched. Only `.env.example` appears as an environment file in history; `.env.local` is ignored. This pattern scan is not a full security audit.
- [x] Package the reviewed local changes in one commit; confirm the worktree is clean. Local `main` is 40 commits ahead of `origin/main`; nothing was pushed.
- [x] Prepare Vercel-specific settings and post-deploy checks in `DEPLOYMENT.md`; verify local Vercel CLI authentication. No Vercel project is linked to this checkout, no production secrets have been configured, and no deploy has started.
- [ ] Make at least one judge link accessible (public GitHub, live demo, or uploaded video). A judge-accessible public demo/video or accessible repository is still needed for submission.
- [ ] Add submitter/team details and complete the Stocklana form from the submitter’s signed-in account and connected wallet.
- Stocklana’s official page was rechecked at 02:51 UTC: LIVE, 286 submissions, and about 17 hours remaining before the September 25, 4:00pm ET deadline. See `PROJECT_REPORT.md` for the timestamped source and pitch summary. No entry submission has occurred.

### Fresh four-role demo verification — September 25, 2026 (04:23 UTC)

- In an isolated local preview, loaded 12 company-linked Anthropic headlines, the selected PreStocks quote/reference mark, and the matching GeckoTerminal USDC pool snapshot.
- Completed Bull, Bear, Neutral, and Council in one live run with visible source links and per-role model disclosure. The Bear role used its disclosed fallback after a temporary provider failure.
- Verified the market-read panel shows the quote-to-pool gap, liquidity and 24-hour volume, close freshness, threshold rules, and limitations. A clean snapshot says “No major data flags,” not “fair value.”
- Lint, production build, and diff whitespace checks pass. This does not close the open controlled-failure UI audit or public deployment checklist.
- The event page was rechecked at 04:41 UTC and shows about 15 hours remaining. A judge-accessible GitHub/demo/video link and team details are still needed; no external release or form submission has occurred.
- Committed the current product, pitch, report, and checklist changes locally; the worktree is clean. Nothing has been pushed or made public.


### Current submission handoff — September 25, 2026

The app and supporting pitch/submission documents are committed and pushed to GitHub `main`. Repo visibility has not been freshly confirmed, and a push alone does not make the repo public. The remaining submission work is to provide one judge-accessible project link, confirm the team and submitting account details, and submit the form before the live deadline. A Vercel deployment is not configured in this checkout.

### Current deployment choice

The user chose to remove the Upstash limiter for the hackathon demo. Debate and audio routes use Gemini's project quotas/provider limits and keep their existing origin, input-size, and error handling. No Upstash database or related Vercel variables are required. This is a deliberate short-term tradeoff; monitor Gemini usage on the public deployment.

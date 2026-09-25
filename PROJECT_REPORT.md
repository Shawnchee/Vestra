# Vestra — project and pitch report

Updated: September 25, 2026, 04:41 UTC
Purpose: explain what the app does, how its parts fit together, what is demo-ready, and how to present it honestly.

## Latest product update: market-read checks and research council

- Vestra's PreStocks listings are tokens designed to provide economic exposure to private companies under PreStocks' product terms. They are not direct company shares and do not reserve a place in a future IPO. See [PreStocks product details](https://prestocks.com/products).
- The Catalyst Monitor connects company-linked headlines to nearby completed closes and shows the PreStocks quote, reference mark, discovered pool close, pool liquidity, and 24-hour volume together.
- A new plain-language market-read check flags large quote or reference-mark gaps (over 20%), low pool liquidity (below $10,000), low 24-hour pool volume (below $1,000), or a daily close more than two days old. Two or more flags produce “Weak market read”; one produces “Use with care”; none produces “No major data flags.” The checks and thresholds are visible in the interface; they are not validated measures of fair value, market safety, or exit liquidity.
- Research has four roles: Bull, Bear, and Neutral run in parallel from the same server-fetched headline and market packet; a Council chair then weighs their arguments. Debate evidence remains headline metadata, not the full article.
- The debate API streams actual node state and each role's completed output to the page. The visible path is Sources → Bull / Bear / Neutral → Council. Partial findings appear while the other roles are still working.
- The Council reports a research read and uncertainties. It is explicitly not a buy/sell decision or promise of returns.
- Council defaults to Google's stable `gemini-3.8-flash`, which is distinct from the Bull and Neutral defaults. `GEMINI_COUNCIL_MODEL` can select the stronger `gemini-3.1-pro-preview`, but Google's model guide identifies that as paid Preview with no free API tier ([model guide](https://ai.google.dev/gemini-api/docs/gemini-3)). The current default avoids requiring a paid preview endpoint.
- Updated the pitch and submission copy to lead with the difference between the PreStocks quote and observed pool conditions. This report's thresholds and copy must remain aligned if implementation changes.
- Isolated-browser verification loaded 12 current Anthropic headlines, PreStocks quote/mark, GeckoTerminal pool data, and a fresh completed-close view. The four-role debate completed in 8.8 seconds; the configured Bear primary model was temporarily unavailable and the disclosed fallback answered it. This is one live happy-path run, not broad provider-outage or factual-accuracy validation.

## The short version

**Vestra helps people research PreStocks by putting company headlines, token prices, and opposing AI analysis in one sourced view, then letting them inspect that token’s Solana pool history.**

The point is not to produce a buy/sell signal. Vestra makes evidence and data disagreements easier to inspect. Its most important trust feature is that it warns when an on-chain pool price cannot safely be compared with the PreStocks catalogue quote.

For a short spoken pitch, timed demo route, judge Q&A, and wording guardrails, see [PITCH.md](./PITCH.md). That guide is aligned with the current app and submission copy.

## The pitch

### One sentence

> Vestra lets a bull and a bear debate the same PreStocks headlines, then shows the selected token’s Solana market.

### 30-second version

> Researching private-company tokens means comparing company headlines, PreStocks prices, and Solana trading activity that may not agree. Vestra puts them in one workflow. A bull and a bear analyze the same headlines, and an editor shows where they agree, what they dispute, and what remains unknown. Market replay follows the selected token’s USDC pool and adds a sample strategy for context. If the pool is quiet or its price differs from PreStocks, Vestra flags the gap. It is a research tool, not a trading signal.

### Problem / product / difference

- **Problem:** company news, PreStocks prices, and Solana trading activity are hard to compare and can disagree.
- **Product:** one short research flow for PreStocks facts, linked headlines, competing interpretations, and separate on-chain market context.
- **Difference:** Vestra shows the headlines behind both sides and treats weak or conflicting market data as part of the answer.

## What the app does

Vestra has two focused screens. A clean visit opens the Anthropic PreStocks listing, chosen as a clearer replay example after live QA found its discovered USDC pool close to the catalogue quote and with substantially more recent activity than the SpaceX pool. Treat those as temporary observations; users can select any supported PreStocks listing.

### Research

1. Select a company from the PreStocks catalogue.
2. Read its current token quote, reference mark, premium/discount, implied valuation, and source timestamp.
3. Review dated company headlines with publisher links.
4. Ask Gemini for four roles using the same bounded headline and market packet:
   - **Bull analyst:** uses the configured primary model to build the strongest reasonable positive interpretation.
   - **Bear analyst:** uses a different model version by default to present the strongest reasonable risks and complications.
   - **Neutral analyst:** separates what the sources state from what remains unknown.
   - **Council chair:** compares the three cases, checks cited claims against the shared headline packet, and calls out agreement, disagreement, and unknowns.
5. Follow evidence citations to the matching headline. Citation IDs are checked against the packet Vestra sent to Gemini, and the result names the model that answered each role.

The Catalyst Monitor also compares the PreStocks quote/reference mark with the selected mint’s discovered pool close. It lists liquidity and 24-hour volume, shows a headline’s nearby completed closes, and displays simple warning flags for large price gaps, low activity, and stale daily closes. Those flags are not a calibrated market-quality score.

The AI receives headline metadata, not the full article. It can therefore reason about what a headline says, but cannot claim that it has read the full story. General crypto headlines are kept out of this company evidence packet.

### Market replay

1. Vestra uses the selected PreStocks mint to find a USDC trading pool on Solana through GeckoTerminal.
2. It displays daily USD candles in LuxAlgo Vela, with pool liquidity and recent volume.
3. It can compare dated company headlines with the last pool close before and first close after the headline’s UTC day. It omits the event-day candle and does not claim the headline caused a price move.
4. An optional 5/20-day moving-average simulation compares a long-or-cash rule with buy-and-hold using the full available pool history. The chart’s 30D/90D selector uses calendar days independently. Because DEX candles can be missing, the strategy explains that missing pool days can make its 5/20-day windows span more calendar days and shows the actual sample dates and observation count. The user can change the assumed cost per trade side.
5. A separate CoinDesk panel provides broad crypto-market context. It is labeled as separate from company evidence.

The simulation is an educational calculation on a DEX pool. It is **not** a PreStocks return, an executable trading result, or a forecast. It uses completed candles, executes a change in position at the next candle’s open, reports its dates and observation count, and marks any open position to the final close without pretending an exit trade happened. It does not model pool impact, funding, or taxes.

## Why PreStocks and Solana matter

The app is organized around the PreStocks catalogue and the actual Solana mint returned for the selected asset. The on-chain part of the workflow looks at the pool for that same mint. This gives the user a direct way to inspect how the token is trading on Solana alongside the PreStocks quote, while also making any basis mismatch visible.

Vestra intentionally supports only PreStocks catalogue assets for the PreStocks award eligibility. Dukascopy FX data is not used: currency-market candles would not be valid history for a PreStocks token.

### Position against adjacent projects

The [Stocklana Baskets](https://stocklanabaskets.com/) site describes an adjacent PreStocks use case: a read-only weighted basket preview, within a broader product focused on basket composition, custody, shares, and allocation. Vestra uses the same PreStocks catalogue, but solves a different job: compare company headlines through sourced bull/bear analysis, then inspect nearby prices for the selected token’s Solana pool. Lead the pitch with evidence quality and the same-source debate; describe the basket project as adjacent, not as a feature Vestra competes to replace. This is a check of a public project page, not an exhaustive search of all submissions.

## Data and services, in plain language

| App area | Source | What Vestra uses it for |
| --- | --- | --- |
| Catalogue and quote | PreStocks API | Supported assets, mint, token/mark prices, supply, and valuations |
| Company coverage | Google News RSS | Headline, publisher, date, and a link through to the story |
| AI analysis | Gemini Developer API | Bull, Bear, and Neutral use the same limited packet; Council compares their cases |
| Pool discovery and history | GeckoTerminal | Find a USDC pool for the selected mint; fetch pool stats and daily candles |
| Chart display | LuxAlgo Vela | Render those fetched candles and dated company headline marks |
| Crypto context | CoinDesk RSS | A separate selection of broader digital-asset headlines |
| Solana mint link | Solana Explorer | Open the selected mint address on-chain |

API keys are read on the server. `.env.local` is ignored by Git; `.env.example` contains names/placeholders only. The watchlist is stored in this browser’s local storage; debate results are not saved to a Vestra server.

**Key hygiene:** the Gemini key was previously shared in this conversation and is configured locally for the preview. It is not in tracked project files, but rotate it in Google AI Studio after the demo and replace the value in the ignored `.env.local` file. Do not publish the key with the source or add it to a deployment without setting it as a server-only secret.

## What is working and what was checked

### Product review for the judge demo — September 25, 2026

This is a code and browser review for Stocklana judges and PreStocks researchers, whose core task is to compare a sourced bull and bear case and then inspect the selected token's Solana pool. Scores are an informed build review, not results from external user testing.

| Dimension | Score | Evidence and remaining friction |
|---|---:|---|
| Onboarding | 8/10 | Opens directly into a usable company research view; no wallet is needed. First action is the debate button after headlines load. |
| Core experience | 8/10 | A live three-role debate completed with source links; a fresh OpenAI market replay loaded 48 Vela candles and the controls responded. External feeds can still vary. |
| Error handling | 7/10 | Headline and AI paths have readable retry states; current live data loaded. Controlled upstream-failure checks remain open. |
| Information architecture | 7/10 | Research and Market replay split the long page. Backtest, news context, and headline replay are collapsed, so the short demo needs deliberate clicks. |
| Visual polish | 8/10 | Distinctive Vestra mark, branded asset marks, Solana identity, custom chart backdrop, and clear bull/bear styling; responsive checks are recorded above. |
| Performance | 6/10 | Headlines and quotes loaded quickly in the observed browser session; AI and market history depend on upstream services and can stall or fail. No formal load benchmark was run. |
| Accessibility | 8/10 | Prior keyboard, focus, small-screen, and contrast checks are recorded in the checklist; not a formal WCAG audit. |
| Feature completeness | 7/10 | Covers catalogue, news, AI debate, pool chart, replay, and sample strategy. Public judge link and production rate-limit setup are still outstanding. |
| **Overall** | **7.5/10** | **Strong local demo when upstream feeds respond; publication, controlled failure QA, and price-source clarity remain open.** |

**Best next steps:** (1) secure a judge-accessible GitHub, live demo, or video link; (2) recheck GeckoTerminal and Gemini shortly before recording and keep their retry states visible if unavailable; (3) configure the production Upstash values before deploying. Do not describe the simulation as PreStocks performance: it uses the discovered pool only.

### UI and brand pass — September 25, 2026

- The first Vestra mark has been superseded by a more legible, transparent, two-tone geometric symbol generated with ImageGen in [`vestra-mark-v7.png`](./public/images/vestra-mark-v7.png). It is 512×512, 72 KB, and is used in the sidebar, app icon, and submission page.
- The Research screen uses the market chart illustration in [`vestra-market-atmosphere.webp`](./public/images/vestra-market-atmosphere.webp) as a more visible but low-contrast page and company-banner backdrop. The existing 72 KB WebP replaced a 1.8 MB PNG.
- Saved companies now reuse the selected listing image instead of showing letter-only circles. The live PreStocks catalogue image loads first; the company-site favicon is the fallback.
- Solana’s official, unmodified logo is served from `https://solana.com/src/img/branding/solanaLogoMark.svg`, the mark linked from [Solana’s official brand page](https://solana.com/branding). The selected company image comes from the live PreStocks listing; the Anthropic logo was also visually opened from PreStocks to confirm the source.
- The two-view layout removes duplicate quote cards from Market replay, leaving the pool chart and market tools as that screen’s focus.
- Market labels and backtest copy now use shorter wording. The long company description was removed from the top card so the company name, logo, and selector scan quickly.
- Current logo prompt: “Create a distinctive, premium Vestra brand mark for an evidence-led market research product where bull and bear perspectives debate. Use a bold abstract monogram or mark, not literal animal heads. Precise geometric vector-like emblem, minimal flat design, legible at small sizes, centered on a square canvas. Warm ivory and restrained lime green on deep charcoal. No words, letters, chart axes, coin symbols, Solana logo, gradients, watermark, or mockup.” The black background was removed with ImageGen while preserving the ivory and chartreuse geometry; the final alpha PNG is [`vestra-mark-v7.png`](./public/images/vestra-mark-v7.png).
- A second visual refinement adds a subtle chart grid behind the atmospheric chart artwork, stronger surface separation, a clearer active range, and distinct green bull / muted red bear accents. It keeps the UI custom and avoids importing a generic component kit.
- Final visual-pass checks: `npm run lint`, `npm run build`, and `git diff --check` passed. The refreshed live preview rendered at a 664 px viewport with the new Vestra logo, PreStocks Anthropic logo, Solana network badge, and the focused Research layout. Earlier responsive checks covered 375, 768, and 1280 px widths.
- Follow-up preview polish: the main company mark and official Solana mark load eagerly, while compact saved-company images remain lazy. The floating Next.js development badge is hidden so it does not cover the demo. A refreshed 664 px browser check confirmed both marks and the Research header render without the badge; Market replay was separately reloaded and showed its pool statistics and 27-candle Vela chart. This is a browser spot-check, not a new full responsive or upstream-error sweep.
- The Market replay loading label says “Finding a USDC pool…”. Pool selection sorts pools with positive reported liquidity and volume; it does not promise that a pool is liquid. Retry remains available when the upstream history request fails.
- Additional local API triage returned the intended validation responses: history without a mint, news without a company, debate without evidence, and malformed debate JSON returned 400; an oversized debate request returned 413; a cross-origin debate request returned 403. These checks did not call Gemini. They do not replace forcing provider outages, rate limits, and every UI empty state; that broader check remains open in [`CHECKLIST.md`](./CHECKLIST.md).
- The UI copy pass included the requested subagent review. No ReactBits or 21st.dev package was added; this pass uses the project’s existing React and CSS.
- The submission tagline and description were shortened to lead with the distinctive shared-headline bull/bear workflow, then explain the two app views and the pool-data limits in plain language. The HTML draft now carries the app’s current generated mark and chart artwork.
- This pass added publisher-site favicons to recognized headline sources, with an initial fallback if a favicon is unavailable. Company marks still come from the selected live PreStocks listing first, while the Solana network badge uses the unmodified official mark at [Solana Brand & Press](https://solana.com/branding).
- Follow-up browser inspection confirmed that the Vestra mark, Solana logo, PreStocks Anthropic logo, and all six mapped headline publisher favicons loaded; the market illustration and quiet grid are visible behind the top-of-page workspace. A subsequent clean browser reload fetched new quotes and six headlines; a fresh three-role debate completed and all citations pointed to visible stories.
- I generated another Vestra mark candidate with ImageGen, then compared it with the existing v7 mark. The new candidate repeated the same split-V motif without improving legibility, so the app keeps the existing, higher-quality v7 asset. Prompt: “A polished, distinctive fintech logo symbol for Vestra, an evidence-led private-market research product. Single centered square icon on a transparent background. No text, letters, wordmark, border, mockup, glow, or shadows. Original geometric V shape formed by two balanced opposing market arguments: left side rises like a bull-market price line, right side descends into a counterweight; both meet around a precise central axis. Warm ivory and restrained chartreuse with negative-space cutouts. Crisp vector-like edges, premium trading-terminal identity, readable at 32px. Must not resemble Solana’s logo or existing brand.”
- The layout follows familiar product patterns: focused views and restrained navigation inspired by [Linear’s view controls](https://linear.app/docs/display-options), and keeping asset/range controls close to the primary chart as shown in [TradingView’s chart UI](https://www.tradingview.com/charting-library-docs/latest/ui_elements/).
- The refreshed Research view was checked at 375 px, 1280 px, and the open preview width. Research and Market replay both fit at 375 px without horizontal overflow; the selected listing, Vestra mark, Solana mark, and company logo loaded.
- ESLint, the production build, and `git diff --check` all passed after the brand and copy updates.

- Production build and ESLint completed successfully after the two-view UI changes.
- Research and Market replay navigation works through shareable `?view=research` and `?view=replay` URLs.
- Live PreStocks quote/mark, company headlines, and publisher links rendered in the browser.
- Company selection changed the selected asset and its displayed company and quote information.
- Market replay loaded the selected mint’s pool, daily candles, chart, pool statistics, catalyst controls, and strategy simulation.
- Fresh browser QA on September 25 Kuala Lumpur time confirmed Research loaded six company headlines and enabled the debate action. Market replay found Anthropic’s ANTHRP/USDC pool and rendered 27 daily candles in Vela. At that moment, the pool showed about $46K liquidity and $243K 24-hour volume; market readings change.
- The CoinDesk panel loaded four dated stories and states that they are broad context, not company evidence. The strategy panel calculated an illustrative pool-only result from 70 daily prices: -5.64% for the sample rule versus -15.63% buy-and-hold, with a 31.88% largest drawdown. These are shallow-pool observations, not PreStocks returns or a forecast.
- Selecting the Sep 24 headline showed the Sep 23 prior close ($1,063.59) and correctly reported that no later daily close was available yet. It linked to the original story and labeled the comparison timing-only, not causal.
- Selecting Anthropic in Research and opening Market replay retained `asset=ANTHROPIC`; the replay showed Anthropic’s mint, its discovered ANTHRP/USDC pool, and the correct 30/90-calendar-day chart range. The company selection is shareable between both views.
- The default demo asset was changed from SpaceX to Anthropic after live comparison. Latest browser QA showed Anthropic’s daily pool close near its PreStocks quote (about $1,034), about $45.4K liquidity, and about $272K 24-hour volume; SpaceX showed a much larger gap and under $30 recent volume. Prices and activity vary; Anthropic is a more readable current example, while the SpaceX view demonstrates the data-quality warning.
- The 30D/90D and transaction-cost controls are interactive; a cost change changed the displayed simulation result.
- CoinDesk headlines rendered in their separate context panel.
- The visual direction uses a restrained chartreuse accent, warm ivory logo, subtle market chart background, clear active navigation, and separated quote/headline/debate panels. It keeps the compact two-view layout and custom React/CSS components rather than adding a third-party component kit.
- The copy trim included the requested subagent review. The original wording stays short and direct; no ReactBits or 21st.dev package was added.
- Latest checks after the logo, background, and saved-company logo changes: ESLint, production build, and `git diff --check` passed. Browser inspection confirms the mark, background, PreStocks Anthropic asset image, and Solana logo load. The latest mobile view at 375 px had no horizontal overflow; previous responsive checks also covered 768 and 1280 px.
- A live debate completed successfully once: all three roles returned and the UI disclosed Bull and Editor on `gemini-3.5-flash-lite`, Bear on fallback `gemini-3.1-flash-lite`. The generated cases included working headline citations, uncertainty notes, and a visible “No headline linked” label on an uncited market-data argument. A later retry returned provider-busy, so provider capacity is intermittent.
- During this final submission pass, a fresh three-role debate completed again after correcting two API request checks: proxy-aware same-origin validation and normalization of the catalogue's optional “PreStocks” suffix. The live result returned all roles, used the six-item source packet, and the Bear's `n6` citation linked to the sixth visible headline. Gemini provider capacity can still vary between attempts.
- Earlier end-to-end browser check on September 25, 2026: the port 3000 development preview returned temporary-unavailable history on three loads, while a separate production-mode local preview on port 3101 returned HTTP 200 for the same mint and rendered 27 daily candles in Vela. The cause was not confirmed at that time. The latest clean reload test below supersedes the interim conclusion that the production path was the only verified demo route.
- After that check, development and production build outputs were separated (`.next-dev` for development; `.next` for build/production). A fresh dev Research load showed current headlines, a three-role debate completed, and Market replay rendered the selected pool chart again. The separate production preview also returned HTTP 200. This supports an output-directory collision as the cause of the earlier dev failure, but does not prove it. Current preview to show: `http://127.0.0.1:3000/?view=research&asset=ANTHROPIC`.
- Fresh clean-reload test on September 25, 2026: the local Research URL returned HTTP 200 and six current company headlines appeared. Start debate returned all three roles—Bull and Editor on `gemini-3.5-flash-lite`, Bear on `gemini-3.1-flash-lite`—with links to the same six-headline packet. Market replay retained `asset=ANTHROPIC`, discovered `ANTHRP / USDC`, returned HTTP 200, and rendered 27 Vela candles. CoinDesk loaded four separate crypto-context stories. The strategy panel calculated a sample return of -9.05% against -18.67% buy-and-hold, a -31.88% largest drop, one closed trade, and a long position at the end over 70 daily observations dated May 2–September 24, 2026. Headline replay correctly showed only the Sep 23 prior close ($1,063.59) for a Sep 24 story, because no later daily close was available. The page had no horizontal overflow at 664 px and the browser recorded no error-level console messages. Market and quote values are volatile; the strategy is pool-only and illustrative.
- I also changed the chart from 90D to 30D and back: the view moved from 27 candles (+50.36%) to 19 (+6.48%), then returned to the 90D default. Changing cost per side from 0.5% to 1% changed the sample strategy return from -9.05% to -10.41% and the largest drop from -31.88% to -32.56%; restoring 0.5% returned both values to the original demo result. These readings change with the underlying pool data.
- The shell’s unprivileged network namespace could not reach or bind the browser’s local port. An escalated read-only check confirmed HTTP 200 for the existing server and market-history route; a second development server was not started because port 3000 was already in use. `npm run lint`, `npm run build`, and `git diff --check` pass after the asset updates.
- Product-quality review of the judge demo: strongest points are the immediate research view, shared evidence packet for opposite AI cases, and clear separation of PreStocks quote from pool-only history. Remaining friction is external provider reliability, collapsed replay tools that can be missed in a short demo, and the lack of a public judge link. This is a build review, not feedback from external users.
- That successful run exposed a broken sixth-headline citation target: the AI could cite item six while Research rendered only five headlines. Research now renders six. Browser DOM inspection confirms `#n6` exists, its publisher link is present, and the page has no horizontal overflow at 375, 768, or 1280px. Vestra cites headlines only; the uncited PreStocks market snapshot is visible and sourced separately in the quote strip.
- UI wording was trimmed for the demo: the main page now says “Company headlines, market prices, and bull and bear views”; replay controls use percentages instead of basis points and plain labels such as “Largest drop”.
- The simulation reports the 5/20-day price rule, costs, sample dates, daily prices after the initial rule period, benchmark, drawdown, closed trades, and end-of-window position. It uses all available pool candles, separate from the calendar-day chart range. The 30D/90D chart buttons now filter by calendar days instead of counting bars.
- The UI reports the last daily pool close against the current PreStocks quote inside the simulation panel, and warns prominently when the gap is large or activity is thin. During QA, the SpaceX pool close was about five times the catalogue quote with under $30 of 24-hour volume. These are time-sensitive readings, not fixed conversion values.
- Browser console error review returned no reported errors during the final UI check.
- Responsive review covered Research and Market replay at 375px, 768px, and 1280px; no horizontal overflow was found. The expanded backtest panel also fit at 375px.
- Keyboard review confirmed a visible focus outline, a Tab path through the controls and into the Vela chart, arrow-key movement between chart bars, and Enter activation of a dated headline replay event. A rendered-text contrast scan across both views and the expanded replay panels found no meaningful text below the estimated AA thresholds; only decorative separators fell below body-text contrast.
- Browser console review found no application errors. It contained two earlier Next.js smooth-scroll route-transition warnings; the document attribute recommended by Next.js is now present.
- `.env.local` is ignored by Git.
- Debate requests now have a 16 KB body cap and accept only a company present in the PreStocks catalogue; replay history is also restricted to catalogue mints, and upstream catalogue/news responses have size limits. The origin check is proxy-aware. The production debate route now fails closed until its Upstash rate limiter is configured; its settings are listed in `.env.example`.

### Live AI reliability

Two fresh three-role Gemini debates have been verified in the browser. The latest used `gemini-3.5-flash-lite` for Bull and Editor and the `gemini-3.1-flash-lite` fallback for Bear. Headline citations matched the supplied packet, including the sixth headline; the UI clearly labels a market observation that has no headline source. One intervening retry hit provider busy. The UI recovers cleanly and does not invent results, but capacity is intermittent. Before recording, leave time for one retry; if it is busy, use the retry state honestly or show a previously completed run.

The default bull model `gemini-3.5-flash-lite`, bear model `gemini-3.8-flash`, and fallback `gemini-3.1-flash-lite` are listed by Google as stable models that support structured output. Google lists free-tier token use for them. Provider capacity is still the observed live limitation. See [Gemini 3.5 Flash-Lite](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite), [Gemini 3.8 Flash](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash), [Gemini 3.1 Flash-Lite](https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-lite), and [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing).

## A simple demo path

Aim for about three minutes and keep the Research view as the opening screen.

1. **Open Research (20 sec).** Explain that Vestra compares company evidence, the PreStocks quote, and Solana trading activity.
2. **Show a company (25 sec).** Point out the live token quote, reference mark, source, and update time.
3. **Show evidence (30 sec).** Open one headline and identify its publisher/date. Explain that the AI sees headline metadata rather than full article text.
4. **Run the debate (45 sec).** Show both opposing cases and then the editor’s synthesis. Follow one evidence reference. If Gemini is unavailable, show the honest retry state rather than presenting fabricated output.
5. **Open Market replay (45 sec).** Show the exact-mint pool chart, liquidity/volume, Vela attribution, and the gap warning.
6. **Show one tool (30 sec).** Either select a dated headline to see nearby closes, or open the strategy simulation and explain its assumptions and limitations.
7. **Close (15 sec).** Briefly select SpaceX to show the low-volume pool warning, then point out CoinDesk is separate context. Finish with: “Vestra helps you see both the case and the quality of the data behind it.”

## Judge questions to be ready for

**Why use two AI sides?**
One summary can hide counterarguments. Vestra gives both roles the same evidence packet and then asks an editor role to identify agreement, disagreement, and missing evidence. It is a structured reading aid, not a truth machine.

**Why build on Solana?**
PreStocks assets in the supported catalogue have Solana mints. Vestra uses the selected mint to inspect the associated on-chain pool and shows the mint address so judges can verify the asset path.

**Why include a backtest if prices do not match?**
The simulation demonstrates an inspectable rule over observed pool candles, while its warning makes the limitation explicit. It does not claim those pool returns equal PreStocks quote returns. Treat it as experimental context, not evidence of strategy performance on PreStocks.

**What happens if the AI provider is down?**
The debate remains unavailable and Vestra shows a retry message. Catalogue, news, and market history can still be inspected. There are no canned debate results presented as live analysis.

**What does the CoinDesk feed prove about the selected company?**
Nothing directly. It is general crypto-market context and is kept separate from the company headline evidence used by the debate.

## Submission position

- **Recommended tracks:** Stocklana Main Track ($100,000 prize pool) and PreStocks — Best Use of PreStocks ($10,000 bounty, split $5,000/$3,000/$2,000 across three winners).
- **Why the PreStocks award fits:** the core asset selector and quote use the PreStocks catalogue, and the Solana market replay follows the selected PreStocks mint. The app does not add other pre-IPO token providers.
- **Submission copy and walkthrough:** see [`SUBMISSION.md`](./SUBMISSION.md) and [`SUBMISSION.html`](./SUBMISSION.html).
- **Official event page:** [Stocklana](https://hackathons.solana.com/hackathons/stocklana). It lists the deadline as September 25, 2026 at 4:00pm ET (September 26 at 4:00am in Kuala Lumpur).
- **Not yet complete:** authenticated, read-only GitHub metadata confirmed `Shawnchee/Vestra` exists and is private; a logged-out visit returns 404. Local `main` has unpushed commits, so GitHub is not yet an accessible judge link. There is no Vercel project linked in this checkout, verified public deployment, uploaded demo video, or submitted form. Stocklana requires at least one accessible GitHub, live demo, or video link. Do not change visibility or push without explicit authorization.

## Remaining work, in order

1. Rotate the Gemini API key that was shared in chat. Replace the local ignored value; do not publish the old key.
2. Before a public deployment, provision Upstash Redis and add `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, and a random `RATE_LIMIT_HASH_SALT` (32+ characters) to the deployment. `/api/debate` now fails closed in production without these settings. It allows 5 requests per 15 minutes per hashed client IP and caps all debates at 40 per day; hashed identifiers are sent to Upstash and expire with their rate-limit window.
3. Keep the verified successful debate as the live demo example if available; otherwise retry once before recording because provider capacity was intermittent.
4. Obtain explicit authorization before making the private GitHub repo public and pushing the local commits, or use a public deployment/video link instead. The configured repository was confirmed private; this checkout has no Vercel project link.
5. Confirm team information and the live deadline on Stocklana, then provide the required accessible link and submit before the deadline.

## Project files

- [`src/components/research-desk.tsx`](./src/components/research-desk.tsx): company selection, quote display, news coverage, debate, and app navigation.
- [`src/components/market-history.tsx`](./src/components/market-history.tsx): pool chart, CoinDesk context, catalyst replay, and simulation.
- [`src/app/api/news/route.ts`](./src/app/api/news/route.ts): company headline discovery.
- [`src/app/api/debate/route.ts`](./src/app/api/debate/route.ts): server-side Gemini roles, response validation, rate limiting, and recoverable errors.
- [`src/app/api/market-history/route.ts`](./src/app/api/market-history/route.ts): selected-mint pool discovery and candle normalization.
- [`src/app/api/crypto-news/route.ts`](./src/app/api/crypto-news/route.ts): separate CoinDesk feed.
- [`CODE_REVIEW.html`](./CODE_REVIEW.html): security and release-readiness findings, including the key-rotation and API-limit actions.
- [`DEPLOYMENT.md`](./DEPLOYMENT.md): hosting setup and post-deploy demo checks. No hosting project is linked yet.
- [`README.md`](./README.md), [`PRD.md`](./PRD.md), and [`CHECKLIST.md`](./CHECKLIST.md): setup, requirements, and submission progress.

## Visual pass — September 25, 2026

- Tightened the app into a dark, comfortable-density trading desk: sharper active navigation, clearer company identity, and calmer bordered surfaces with chartreuse reserved for key actions and selection.
- Removed the rising-market artwork behind the data. The background now uses a subdued grid and the existing geometric market texture; the Vela candle chart is the only prominent price graphic.
- Made the bull and bear result cards read as a direct comparison. Green and red identify the two opposing roles, and a neutral editor panel remains visually separate.
- Added PreStocks’ official wordmark to the page’s section label, with a text fallback if it cannot load. Solana’s official mark remains in the network badge, company marks load from the PreStocks catalogue when supplied, and recognized publishers use their own favicons.
- Generated and reviewed multiple Vestra logo concepts. V7 was kept during this earlier pass for its small-size legibility; the latest pass selects V8 for the sidebar, browser icon, and share card.
- The original wording subagent also performed a read-only check of mark coverage and visual consistency. No ReactBits/21st.dev components were added; the product uses its existing CSS and Lucide icons.
- Rechecked both Research and Market replay at 375px, 768px, and 1280px. The document stayed within the viewport at all six sizes. The CoinDesk, strategy, and headline-replay details start collapsed, leaving the Vela chart as the main Market replay surface.
- Latest browser review loaded the Vestra, PreStocks, Solana, Anthropic, and recognized publisher marks. The browser returned no error-level console messages. `npm run lint`, `npm run build`, and `git diff --check` pass.
- Reloaded Market replay and verified the selected Anthropic mint still discovers its ANTHRP/USDC pool and loads 27 Vela candles. The 5/20-day backtest opened at 375px without horizontal overflow. At that check it used 70 daily observations and showed -9.09% for the rule against -18.71% buy-and-hold; values vary with pool data.
- Ran a new live three-role debate on September 25: Bull and Editor used `gemini-3.5-flash-lite`; Bear used `gemini-3.1-flash-lite`. The returned roles shared the headline packet, cited visible headlines, and produced agreement, disagreement, unknowns, and invalidating conditions. Reviewing the result at 664px exposed narrow side-by-side cards; they now stack through 920px and return to the comparison layout at 1280px. 375px, 768px, and 1280px checks showed no horizontal overflow.

### Latest visual and source pass — September 25, 2026

- Generated a new transparent, single-color V-shaped Vestra mark with the built-in ImageGen tool and saved it at [`public/images/vestra-mark-v8.png`](./public/images/vestra-mark-v8.png). The sidebar, browser icon, Open Graph route, and regenerated [`1200×630 share card`](./submission-assets/vestra-share-card.png) use the same mark. V7 remains in the repository as an earlier concept.
- ImageGen prompt: “Create a distinctive restrained monogram symbol for Vestra, a Solana-based research app where bull and bear analysts debate evidence. Existing palette: deep forest charcoal, muted warm white, pale mint green. Premium editorial finance identity, flat geometric logo mark with negative space, vector-friendly. A centered abstract V shape built from opposing angled forms converging at a shared center. Pale mint on deep charcoal. No wordmark, letters, text, animals, coin symbol, gradient, shadows, or watermark. Legible at 24 pixels.”
- Company identity now tries each mapped company’s own `/favicon.ico` first, then the Google favicon cache, then the image supplied by the live PreStocks catalogue. The mark is reused in both the selected company header and Saved companies. Anthropic’s own favicon was checked directly. The Solana badge continues to use the unmodified mark from Solana’s website; its official brand assets and use guidance are documented at [solana.com/branding](https://solana.com/branding).
- Kept the interface custom to Vestra rather than adding ReactBits or 21st.dev packages: the existing market-workstation layout, quiet grid texture, genuine company marks, and direct bull-versus-bear comparison are the fit for this short research demo.
- Added explicit freshness to both sides of the quote comparison: the PreStocks quote fetch time and the date of the last daily pool close. The quote/pool gap remains unexplained and is shown as a comparison warning, not a signal.
- Ran `npm run lint`, `npm run build`, and `git diff --check` successfully. The 1280×720 Research and Market replay previews show the V8 mark, Anthropic’s own favicon, official Solana mark, and updated dashboard backdrop. At 375px, both quote and pool-close timestamps are visible, neither clips, and the document width equals the viewport.

## Final readiness check — September 25, 2026

- Inspected the live browser elements: the Vestra mark loaded locally; the Anthropic company icon loaded from its own favicon; the PreStocks wordmark loaded from PreStocks; the Solana mark loaded from Solana’s official brand path; and publisher favicons loaded for Reuters, Anthropic, WSJ, and Politico. The UI uses provider/brand marks with text fallbacks rather than AI-generated company logos.
- Checked the known Gemini-key marker without printing or reading credential contents: it is absent from working-tree files and Git history, and `.env.local` is covered by `.gitignore`. The credential was disclosed in chat, so replace it in Google AI Studio before any public deployment; this source check does not revoke it.
- Rechecked the official Stocklana page at 2026-09-24 23:52 UTC: it showed about 20 hours until the September 25, 2026, 4:00pm ET deadline and requires at least one GitHub, live demo, or video link. The Main Track prize pool is $100,000; the separate PreStocks Best Use bounty is $10,000 across three awards. Vestra fits both, and its PreStocks-only catalogue respects the bounty’s exclusion of non-PreStocks pre-IPO tokens. Pyth’s listed award is three months of Pro access, so it is not a target for this submission.
- Public submission is still incomplete: the GitHub repo is private, local commits are not pushed, there is no public demo URL or uploaded video, and the form has not been submitted. No public release action was taken.
- Added a 1200×630 share card for Open Graph and X using the existing Vestra mark and actual product framing. The production build generated both image routes; local browser inspection confirmed the PNG dimensions and the page’s title, description, and social-image metadata. Set `NEXT_PUBLIC_SITE_URL` on non-Vercel hosts so links resolve to the public domain; Vercel deployments use `VERCEL_URL` when no canonical URL is set.
- Exported the verified production image to [`submission-assets/vestra-share-card.png`](./submission-assets/vestra-share-card.png) and added it to the README. It is ready to attach as the project cover image. This is a share card, not a recorded app walkthrough; the checklist still calls for an app screenshot or video.
- Rechecked SpaceX Market replay on live data: the discovered pool close was 412.8% above the PreStocks quote with $27.28 of 24-hour volume. The app continues to say the gap is unexplained and warns that low volume makes prices unreliable. I replaced “liquid USDC pool” with “USDC pool”/“recent trading activity” because pool selection only checks that liquidity and 24-hour volume are positive; it does not establish a defensible liquidity threshold. `npm run lint` and `npm run build` pass after this copy correction.
- Exercised an invalid shared URL (`?view=replay&asset=NOT_A_PRESTOCK`): the app previously rendered Anthropic replay under the invalid URL. It now redirects to `?view=replay&asset=ANTHROPIC`; the selected company, pool chart, and shareable URL agree. The fallback’s live chart loaded 27 daily candles.
- Compacted Market replay for the demo: replaced its ambiguous red-to-green reference bar with the exact signed percent above/below PreStocks reference, removed the replay card’s 300px minimum height, and tightened the spacing. At a 1280×720 view the Vela chart heading and range controls are now visible without scrolling. At 375px the market-detail labels wrap cleanly across two columns plus a full-width mint row; DOM width check was 375/375 px.
- Live cross-asset QA found that company selection changed the displayed data without changing the URL. Company changes now replace the `asset` query value while preserving the current view. Selecting OpenAI produced `?view=replay&asset=OPENAI`; after a full browser reload it retained the OpenAI quote, OpenAI mint, discovered OPENAI/USDC pool, and 48 daily candles. That OpenAI pool was 44.5% above the quote with $455.3K in 24-hour volume, so low volume alone does not explain all quote/pool differences. The UI correctly says the gap is unexplained and uses pool-only backtest returns.
- Checked the same selector on Research by switching OpenAI to Polymarket: the URL became `?view=research&asset=POLYMARKET` and the quote snapshot matched the selected company.

### Brand and asset refresh — September 25, 2026

- Generated a two-tone Vestra mark with the built-in ImageGen tool and selected the transparent 1254×1254 image at [`public/images/vestra-mark-v9.png`](./public/images/vestra-mark-v9.png). Its opposing mint and copper strokes form a V without using a stock chart or literal bull/bear art. I updated the sidebar, browser icon, share-image route, and submission page to use the same mark; V8 remains as a prior design.
- Selected ImageGen prompt (built-in ImageGen): “Use case: logo-brand. Asset type: product logo mark for a premium financial research web app called Vestra. Primary request: create a distinctive abstract mark only, no wordmark, for Vestra: an elegant V-shaped pair of opposing market currents meeting at a precise center, suggesting bull and bear debate and price discovery without using literal animals or currency symbols. Style/medium: restrained editorial fintech identity, crisp vector-like geometry rendered as a clean high-resolution raster mark. Composition/framing: centered standalone symbol, generous clear space, strong silhouette readable at 24px and 64px. Lighting/mood: flat graphic, calm, considered, trustworthy. Color palette: pale mint and muted warm copper against a deep evergreen-charcoal field. Constraints: square image, dark solid background matching #101512, clean edges, no gradients, no words, no letters, no chart axes, no candlesticks, no coin, no watermark.”
- Verified the company marks remain real assets: mapped company favicons are tried first, the Google favicon cache is the fallback, and the live PreStocks listing image is the last fallback. Publisher favicons follow the same visual pattern with a text initial if the icon fails. No AI-generated company marks are used.
- Solana’s network badge loads its official logomark from `https://solana.com/src/img/branding/solanaLogoMark.svg`, linked from Solana’s official [Brand & Press page](https://solana.com/branding). Its image is not recolored or altered. PreStocks’ official wordmark remains sourced from PreStocks.
- Visual direction continues to borrow only broad information hierarchy from market products: clear selected-asset identity, a compact quote strip, headline rows, then the bull/bear evidence comparison. TradingView documents this broad combination of quote, chart, analysis, and top stories for dashboards in its [widget overview](https://www.tradingview.com/widget-docs/solutions/); Vestra uses its own layout and copy. No ReactBits or 21st.dev package was added because the product already has custom, working panels and chart controls.
- The selected preview mark is visibly cleaner against the app’s dark background than in the image tool’s transparent preview. The market background remains the existing subdued angular texture rather than a rising price illustration, so it adds depth without visually promising an upward market.
- Verification for this refresh: `npm run lint`, `npm run build`, and `git diff --check` passed. The production build generated the 1200×630 Open Graph image, which now uses V9 and replaces the old V8 share card in `submission-assets/vestra-share-card.png`. I reloaded Research and Market replay in the open browser and checked that V9, the official Solana SVG, PreStocks’ wordmark, Anthropic’s site favicon, Figure AI’s Google favicon, and the recognized publisher favicons all load. No external submission, public release, or upload has been performed.

### Submission-day functionality audit — September 25, 2026

- The live Stocklana page still showed `LIVE` at 00:16 UTC, listed 278 submissions, and said submissions close Friday, September 25 at 4:00pm ET. It requires an accessible GitHub, demo, or video link. Vestra remains eligible for Main Track and the PreStocks Best Use bounty; the latter excludes projects that integrate non-PreStocks pre-IPO tokens. Source: [official Stocklana page](https://hackathons.solana.com/hackathons/stocklana).
- A fresh Research browser load returned six Anthropic headlines and a working PreStocks quote. Both Research and Market replay retained the selected company; Market replay loaded Figure AI’s USDC pool and Vela chart. The actual image URLs for Vestra, Solana, PreStocks, Anthropic, Figure AI, and recognized publishers all returned nonzero image sizes.
- The audit found a confusing source footer: an `N` badge was read by assistive tech as though it were part of “N Headlines found.” Replaced it with a Newspaper icon and the explicit label “Google News · Links open at the publisher.” The refreshed page’s accessibility tree now reports that label clearly. `npm run lint`, `npm run build`, and `git diff --check` passed after the change.
- Remaining release work is substantive and still open: capture a real app screenshot or sub-three-minute demo video, exercise all empty/upstream-error states under controlled conditions, resolve or clearly explain PreStocks-versus-pool price basis across supported assets, configure production Upstash limits, and provide an accessible public GitHub/demo/video link plus team details. No credential configuration, push, deployment, upload, or submission has been performed.


### Visual and wording refresh — September 25, 2026

- Generated a new neutral market backdrop with ImageGen and saved the compressed image at [`public/images/vestra-market-atmosphere-v2.webp`](./public/images/vestra-market-atmosphere-v2.webp). It uses balanced mint and copper market traces rather than a one-direction trend. The app background and selected-company banner now use it; the 1.8 MB PNG intermediate was removed after conversion to a 40 KB WebP.
- Kept the existing two-tone V9 logo so the app, favicon, social preview, and submission card stay consistent. The app already uses the official Solana network mark, official PreStocks wordmark, mapped company favicons, and publisher marks with fallbacks; no generated asset is substituted for a real company or network logo.
- A read-only subagent copy review found replay terms likely to slow down a general judge. I simplified the strategy rule, result labels, end-position label, headline replay explanation, and debate preview while keeping the pool-only return and risk disclosures intact.
- ReactBits/21st.dev components were not added: this pass uses the existing custom Vestra layout and CSS so the bull/bear comparison, chart, and source disclosures stay consistent.
- Final checks passed: `npm run lint`, `npm run build`, and `git diff --check`. Reloaded both open demo views: Research loaded the refreshed Anthropic headlines and simpler debate preview; Market replay loaded Figure AI pool candles, Vela, the low-volume warning, and the updated plain-language section labels. No deployment, push, public upload, or hackathon submission was made.


### Live demo smoke-check — September 25, 2026 (00:35 UTC)

- Rechecked the official Stocklana page at 00:35 UTC: it remained LIVE, showed about 20 hours to the September 25, 4:00pm ET deadline, listed 278 submissions, and required at least one accessible GitHub, live-demo, or video link. This deadline and countdown are time-sensitive; confirm again before entry. [Official event page](https://hackathons.solana.com/hackathons/stocklana).
- Corrected the copy-ready tagline across README, submission draft/HTML, and this report so it says the app shows the selected token’s market after the debate; it no longer implies the pool validates AI claims.
- In a temporary browser tab, selected OpenAI in Research. The quote, headlines, company logo, and `?view=research&asset=OPENAI` URL updated together. Opening Market replay retained that asset and mint. The OpenAI/USDC GeckoTerminal pool loaded 48 daily candles in Vela; the selected pool closed at $1,949.68 versus the PreStocks token quote of $1,346.27 (44.8% higher). This remains an unexplained source-price difference, not evidence that either source is wrong.
- The 30-day control filtered the chart to 31 candles; returning to 90 days restored 48. The backtest used 70 daily observations. Raising the per-side trading cost from 0.5% to 1% lowered the example strategy return from 36.79% to 33.39%; restoring 0.5% restored 36.79%. These figures are volatile live sample-pool results.
- Expanded CoinDesk and confirmed four current crypto stories appear under the explicit “general market context” heading; they are kept outside company debate evidence. Selecting a dated OpenAI headline displayed the September 23 prior close and stated that no later daily close was available, rather than inventing a post-headline return.
- After the visual refresh, checked the replay document width at 375px, 768px, and 1280px. At each size, document width matched the viewport exactly. A desktop 1280×720 view showed V9, OpenAI’s company mark, the official Solana badge, PreStocks wordmark, price panel, and Vela chart.
- This is a live-data interaction smoke-check, not controlled upstream-failure testing. The checklist still leaves those error/empty states, an exportable screenshot/video, the unexplained PreStocks/pool basis, production Upstash configuration, and an accessible submission link open. No external release or form submission was performed.


### Logo and visual identity refresh — September 25, 2026

- Used the built-in ImageGen tool to create a fresh Vestra mark and selected the clear, two-tone ivory/mint V in [`public/images/vestra-mark-v10.png`](./public/images/vestra-mark-v10.png). The v9 mark remains in the repository as a previous concept. Updated the app lockup, browser icon, share-image renderer, and submission page to use the selected v10 mark.
- ImageGen mark prompt: “Create a distinctive, art-directed geometric V symbol for an evidence-led financial research app, polished and professional rather than generic. Precise flat vector-like emblem. Center on a transparent square canvas with generous margin, readable at 24 px. Warm ivory and restrained pale mint/chartreuse. Abstract V assembled from two opposing angular forms converging around a shared center. No literal animals, and distinct from Solana’s logo. Avoid text, wordmark, coin, candlesticks, chart axes, border, mockup, glow, shadows, watermark, and black background.”
- Generated a new wide, low-contrast editorial texture at [`public/images/vestra-market-atmosphere-v3.webp`](./public/images/vestra-market-atmosphere-v3.webp), used as the app’s page backdrop and in the selected-company banner. It leaves the center quiet, places fine topographic forms near the edges, and avoids fake price data and a one-way trend. The asset is 91 KB WebP.
- Confirmed real brand marks remain sourced from the brands: company favicons are tried from each company’s own domain, then Google’s favicon cache, then PreStocks’ live catalogue image. The Solana badge references its unmodified official logomark and brand guidance at [solana.com/branding](https://solana.com/branding); the PreStocks wordmark is from its own site. Any broken image falls back to a text label or catalogue image. AI-generated artwork is used only for Vestra’s own identity and background.
- The design uses Vestra’s custom CSS and existing Vela chart rather than adding ReactBits/21st.dev components or another UI dependency. This keeps the two research views consistent and the submission build lightweight; visual direction borrows only broad information hierarchy from established market interfaces.
- Fresh visual QA checked Research and Market replay. At 375px, document width remained 375px; at 1280px, the desktop workspace fit the viewport. Live browser checks confirmed the V10 app mark, Anthropic company favicon, official Solana SVG, PreStocks wordmark, publisher favicons, generated background, live PreStocks quote, and Figure AI’s 18-candle Vela pool chart with its low-volume warning. The app still keeps both views separate for a shorter demo.
- `npm run lint`, `npm run build`, and `git diff --check` passed. The build-generated 1200×630 social image now uses V10 and was copied to [`submission-assets/vestra-share-card.png`](./submission-assets/vestra-share-card.png). The PreStocks/Solana assets were reachable in the current browser; external asset failure fallback testing remains open. No deploy, public upload, push, or hackathon submission was performed.
- A replay QA pass found an incomplete-day candle: at 01:04 UTC on September 25, Anduril’s feed displayed a Sep 25 candle as “last daily close.” The history route now excludes candles dated on the current UTC day, so chart history, headline timing, and the backtest use completed daily sessions only. The shorter label now reads “Last completed close.” This is a conservative interpretation of the live provider timestamps; report the displayed UTC date with the observation count when discussing results.
- Verification after the data fix: Anduril’s replay showed the Sep 24 completed close and 45 chart candles. Its backtest used 36 measured daily prices through Sep 24; at the live snapshot, the 0.5% cost case returned +20.21% versus +24.94% buy-and-hold, while 1.0% costs lowered the strategy result to +19.01%. Restoring 0.5% restored +20.21%. Figure AI’s pool had only 18 completed daily candles and correctly showed that 21 are required before calculating the sample strategy. These live, shallow-pool results are not PreStocks returns or forecasts.

### Brand asset and debate-card refinement — September 25, 2026 (01:34 UTC)

- Generated a fresh transparent Vestra mark with the built-in ImageGen tool and saved it as [`public/images/vestra-mark-v11.png`](./public/images/vestra-mark-v11.png). The square 1254 × 1254 PNG keeps the warm ivory and mint V, with a simple silhouette that reads at app-icon size. The app lockup, browser icon, social-image renderer, and submission page now use V11; V10 remains in the repo as the previous version.
- ImageGen prompt: “Use case: logo-brand. Asset type: Vestra app symbol, used as a small favicon and dashboard sidebar mark. Create a distinctive, restrained geometric V mark for an evidence-led private-market research product called Vestra. Crisp vector-like flat mark, simple solid forms, transparent background. Center a single icon with generous transparent margin on a square canvas, clear at 24 px. Use warm ivory and muted fresh mint for a dark graphite research interface. No text, no letters except an abstract V shape, no gradients, glow, trading chart, coins, bull/bear mascots, border, or mockup; preserve genuine transparent alpha.” This generated asset is for Vestra’s identity only; the Solana and company marks remain real brand assets.
- Company logos load from each mapped company’s own favicon, then a favicon cache, then the live PreStocks catalogue image. The network badge uses the unmodified Solana logomark from `solana.com`, linked from the official [Brand & Press page](https://solana.com/branding); the PreStocks wordmark comes from PreStocks’ own site. Text/initial fallbacks remain in place for failed image loads.
- Added faint “UP” and “RISK” typographic marks and separate green and red edge accents to the opposing debate cards, while keeping the overall interface quiet enough for evidence text. The existing original CSS system and market-terminal hierarchy remain in use; no ReactBits/21st.dev package or external component dependency was added.
- Rebuilt the 1200 × 630 social card from the production Open Graph renderer using V11 and replaced [`submission-assets/vestra-share-card.png`](./submission-assets/vestra-share-card.png). The rendered app shows the updated identity, PreStocks wordmark, official Solana mark, Anthropic favicon, and the live company headline and price data.
- Clicked “Start debate” on the Research page with current Anthropic headlines. The request completed and displayed three roles, shared source links, confidence, and a neutral synthesis. This interaction check confirms the demo path; it is not a claim that the generated analysis is factually verified, and the UI explicitly says the models see headline details and a market snapshot rather than full articles.
- A subagent made a copy-only simplification pass in [`src/components/market-history.tsx`](./src/components/market-history.tsx): “Liquidity in pool” is clearer, the backtest steps use plainer sentences while retaining the pool-vs-PreStocks, gap, entry-price, cost, open-position, omitted-cost, and uncertainty notes, and headline replay now says the headline-day close is skipped. Technical terms that explain the data or method remain.
- `npm run lint`, `npm run build`, and `git diff --check` passed after the visual changes. No public upload, deployment, push, or hackathon submission was performed.

### UI, route QA, and submission check — September 25, 2026 (02:23 UTC)

- Replaced the barely visible page texture with a new 117 KB ImageGen-generated WebP at [`public/images/vestra-market-atmosphere-v4.webp`](./public/images/vestra-market-atmosphere-v4.webp). Stronger edge detail frames the dashboard while its center stays quiet; softened the background overlays and repeated the artwork in the company banner. A temporary local browser tab confirmed the texture renders behind the desk and the text/cards remain readable.
- Kept the existing Vestra V11 symbol: a new generated alternate was explored but looked busier at icon scale. The active app mark remains consistent across the lockup, browser icon, and share image. Company and publisher favicons still use their mapped brand domains with fallbacks; the network badge loads `solana.com`’s official SVG and the PreStocks badge loads its official wordmark. These marks are not generated artwork.
- No ReactBits/21st.dev dependency was added. The app keeps its own CSS, existing two-screen navigation, and trading-workstation hierarchy; the visual improvement comes from stronger but controlled art direction rather than a component-library reskin.
- Functional recheck in a temporary browser tab: Research loaded six Anthropic headlines and its live PreStocks quote; navigation retained the ANTHROPIC asset; replay found the matching USDC pool and rendered 27 completed candles; the sample strategy calculated from 69 daily prices; CoinDesk loaded separately from company evidence; a Sep 24 headline replay showed the prior close and correctly stated there was no later completed close. No code path for the model or pricing logic changed in this visual pass.
- `npm run lint`, `npm run build`, and `git diff --check` pass with the V4 asset wired in. The older V2/V3 artwork remains archived as previous designs, but the app and brand guide point to V4.
- Refreshed the copy-ready [`SUBMISSION.html`](./SUBMISSION.html) to use V4, align the SpaceX demo beat with the issuer lifecycle notice, and reflect the latest observed repository and submission status. `SUBMISSION.md` and the HTML draft now agree on the missing public link and team/wallet handoff.
- Checked environment-variable presence without printing values: the Gemini key is configured locally; all three production Upstash settings remain unset. Raw HTTP access from the shell/browser is restricted, so I loaded the optimized route modules directly and intercepted every provider fetch in-process. No requests went to Google News, CoinDesk, PreStocks, GeckoTerminal, Upstash, or Gemini during these tests.
- Built-route results: News empty feed 200 and outage 502; CoinDesk valid story 200, empty feed 502, and provider outage 502; PreStocks failure 503; unsupported mint, no eligible USDC pool, and insufficient candle history 404; GeckoTerminal outage 502; debate missing key 503, invalid JSON/evidence 400, oversized body 413, and cross-origin 403; production Upstash unconfigured/unavailable 503 and rate-limited 429. With synthetic PreStocks, Upstash, and Gemini responses, a Gemini primary outage retried both analyst models through the fallback, returned the editor synthesis, and produced all three roles (200). When every Gemini attempt returned 503, the route returned the expected retryable `PROVIDER_BUSY` response (503). This does not replace visual browser confirmation of error/retry states.
- Rechecked the official Stocklana page at 02:23 UTC: LIVE, 286 submissions, $126,000 total prize pool, about 18 hours remaining, deadline September 25 at 4:00pm ET (September 26 at 4:00am Kuala Lumpur). The PreStocks bounty is $10,000 across three awards and excludes non-PreStocks pre-IPO tokens. The submit page still requires sign-in and a connected wallet before showing the form. No wallet connection, public link, deployment, upload, or submission was performed.

### Final submission window check — September 25, 2026 (01:15 UTC)

- The official [Stocklana page](https://hackathons.solana.com/hackathons/stocklana) showed LIVE, 281 submissions, a $126,000 prize pool, and about 19 hours until its September 25, 4:00pm ET deadline (September 26, 4:00am in Kuala Lumpur). Its PreStocks bounty is $10,000 across three awards and excludes any project integrating non-PreStocks pre-IPO tokens. The page requires at least one accessible GitHub, live-demo, or video link. These counts and countdown are point-in-time values; check the event page again before submission.
- Added one plain-language Solana rationale to the project description: Vestra follows each selected PreStocks mint to its Solana USDC pool and displays those on-chain prices. The product remains read-only and does not imply the pool validates news or PreStocks’ independent quote.
- The final accessible-link requirement remains open: the connected GitHub repository is private and the app has no public deployment or demo video link. No public sharing, upload, or form submission was performed.

### Submission page recheck — September 25, 2026 (01:41 UTC)

- The official [Stocklana page](https://hackathons.solana.com/hackathons/stocklana) still says LIVE, lists 281 submissions and a $126,000 prize pool, and shows about 19 hours remaining before submissions close on September 25 at 4:00pm ET. It requires an accessible GitHub, live demo, or video link.
- Opening the official [Submit Project page](https://hackathons.solana.com/hackathons/stocklana/submit) shows “Sign in to submit a project” and a “Connect Wallet” action before the form. I did not sign in, connect a wallet, or submit. The project needs a user-selected wallet/account, an accessible judge-facing link, and complete team details before entry.

### PreStocks lifecycle notice and price fields — September 25, 2026 (01:49 UTC)

- The live PreStocks API returns separate `tokenPrice`, `markPrice`, `impliedValuation`, and `markValuation` fields. PreStocks’ Products page labels “Token Price,” “Implied Val,” and “Mark Price Premium”; neither the API response nor its public Products/FAQ pages documents how a particular external GeckoTerminal pool price reconciles with those fields. The app compares the selected pool’s last completed USD close with `tokenPrice` and warns on a large gap; its warning correctly leaves the underlying pricing mechanism unresolved. [PreStocks API](https://prestocks.com/api/prestocks), [Products](https://prestocks.com/products), [FAQ](https://prestocks.com/faq).
- The official [SpaceX PreStocks page](https://prestocks.com/spacex) says SpaceX has gone public and says SpaceX PreStocks must be swapped for SPCXx or another token before March 12, 2027, or they may expire worthless. I added a notice linked to that product page whenever SPACEX is selected, in both Research and Market replay. The demo script now shows this notice rather than presenting SpaceX simply as a pre-IPO company. This is a point-in-time issuer notice, not a lifecycle-feed integration.
- Verified the notice and external link in the browser on both `?view=research&asset=SPACEX` and `?view=replay&asset=SPACEX`. Fresh app data rendered on both screens. `npm run lint`, `npm run build`, and `git diff --check` passed after this change.

### Brand assets and interface polish — September 25, 2026 (02:33 UTC)

- Used the built-in ImageGen tool for a new transparent Vestra symbol and saved it at [`public/images/vestra-mark-v12.png`](./public/images/vestra-mark-v12.png). The 1254 × 1254 image has an alpha channel and uses two opposing ivory/mint strokes that meet in a compact V. The app lockup, browser icon, social share renderer, submission page, and brand guide now share this same mark. The existing V11 is retained as a prior iteration.
- Increased the visibility of the existing V4 market texture and restrained mint glow in the page backdrop while retaining opaque, high-contrast panels. The company banner keeps the stronger crop of the same editorial asset.
- Regenerated and visually inspected [`submission-assets/vestra-share-card.png`](./submission-assets/vestra-share-card.png) from the built app’s Open Graph image renderer so the README and social preview use the same V12 identity.
- Kept Solana’s official logo mark from its `solana.com` source URL and the official PreStocks logo. Company marks continue to resolve from each issuer’s own site first, then the favicon service, with the active PreStocks catalogue image as a final image fallback. Added publisher favicon mappings for Bloomberg, The New York Times, The Information, AP, Financial Times, CNBC, TechCrunch, The Verge, Wired, and Yahoo Finance so recognized headline sources show their own marks instead of initials. Solana lists its logo mark among its official [Brand & Press assets](https://solana.com/branding).
- Reused the already selected V4 editorial market texture in the backdrop and company banner; the dashboard already contains distinct research and market replay views. This visual pass keeps the current product layout and styling rather than adding a component library or copying another app’s artwork.
- Browser verification confirmed the new brand mark, Anthropic mark, official Solana logo mark, official PreStocks wordmark, and live favicons for Reuters, The New York Times, Bloomberg, and Politico. The Figure AI market-replay screen rendered its company mark, PreStocks prices, Solana pool chart, and Vela attribution. `npm run lint`, `npm run build`, and `git diff --check` passed.
- Rechecked the official Stocklana page at 02:36 UTC: still LIVE, 286 submissions, $126,000 total prize pool, and about 18 hours before the September 25, 4:00pm ET deadline. The PreStocks Best Use bounty remains $10,000 across three awards and excludes non-PreStocks pre-IPO tokens. [Official event page](https://hackathons.solana.com/hackathons/stocklana).

### Submission copy and deployment handoff — September 25, 2026 (02:47 UTC)

- Expanded the judge-facing project description in `SUBMISSION.md` and `SUBMISSION.html` to 216 words. It now names the research problem, explains the product and exact-mint Solana use, calls out limitations, and states a realistic next step. The copy was checked against the event’s PreStocks-only eligibility rule; no non-PreStocks pre-IPO assets are integrated.
- Hardened the submission page’s “Copy description” control: when clipboard access is unavailable for a local HTML file, the text is selected for manual copying instead of leaving the button broken.
- Fixed `DEPLOYMENT.md` to match the current checkout: local `main` is 39 commits ahead of `origin/main` and has uncommitted changes. The instructions now require review before publishing or connecting a host.
- Stocklana’s official [event page](https://hackathons.solana.com/hackathons/stocklana) requires an accessible GitHub, live demo, or video. The local entry is more complete, but it is not submitted and still has no accessible judge link.

### Pitch pack and final window check — September 25, 2026 (02:51 UTC)

- Added [`PITCH.md`](./PITCH.md): one-line and 30-second pitches, a short demo route, likely judge questions, and wording guardrails for the pool-only simulation and AI analysis. Linked it from the README and this report.
- Rechecked the official [Stocklana event page](https://hackathons.solana.com/hackathons/stocklana). It is still LIVE, shows 286 submissions, and says submissions close today, September 25, at 4:00pm ET (about 17 hours from this check). The page requires at least one accessible GitHub, live demo, or video link. The PreStocks bounty asks for projects using PreStocks and excludes projects integrating non-PreStocks pre-IPO tokens; Vestra remains limited to the PreStocks catalogue.
- Local app, entry copy, demo instructions, and pitch notes are prepared. Submission is still blocked on an accessible judge link and submitter/team details. No public release or submission was made.
- Final local verification after the pitch/doc updates: `npm run lint`, `npm run build`, and `git diff --check` all pass. This validates the checked-out app build; it does not replace a judge-facing deployment check.
- Read-only pre-publication review scanned reachable Git history diffs for Google, AWS, GitHub, Stripe, and Slack key formats and private-key blocks; none matched. Git history contains `.env.example` only, not `.env.local`; `.env.local` is ignored. This pattern scan is not a complete security audit and does not check unreachable Git objects or credentials outside those formats.
- Committed the reviewed pitch, entry copy, interface polish, and brand assets locally as `Prepare Vestra hackathon pitch and visual assets`. Local `main` is now 40 commits ahead of `origin/main` and the worktree is clean. Nothing has been pushed or made public.
- Checked Vercel setup: CLI 56.3.1 is installed and authenticated, but this checkout has no `.vercel` link and the filtered account project lookup returned no Vestra match. The app requires no special Vercel config; `maxDuration = 60` is already set on the debate API route. Added Vercel root/build, secret, preview-access, and deploy-smoke-check instructions to `DEPLOYMENT.md`. No Vercel project was created and no deployment was started.

### Market-read panel and fresh local demo check — September 25, 2026 (04:23 UTC)

- Added visible PreStocks quote-to-pool-close divergence and replaced the inaccurate “pool depth” label with “pool liquidity”; the interface now says liquidity is not guaranteed exit capacity.
- Added simple market-read flags for quote/mark gaps above 20%, pool liquidity below $10,000, 24-hour volume below $1,000, and completed daily closes older than two days. The UI lists these thresholds, the observed flags, and an explicit limitation. The status label is a warning summary, not a calibrated score or a statement of fair value.
- Ran a fresh isolated local preview with outbound data access. It loaded 12 company-linked headlines, PreStocks quote/mark, and GeckoTerminal pool/liquidity/volume data. The four-role debate completed in 8.8 seconds with source links and model names. Gemini temporarily rejected the Bear primary model; the configured fallback answered, and its actual model name was shown in the app.
- `npm run lint`, `npm run build`, and `git diff --check` passed after this panel and pitch-copy update. The live check verifies one success path, not general factual accuracy, provider uptime, or every error state.
- Telegram notifications remain out of this submission build: there is no account/chat-linking or persistent delivery backend, and the user has not selected a notification design. Browser-only watchlist storage is not background notification support.
- Stocklana’s official page was rechecked at 04:41 UTC: it is LIVE, lists 289 submissions, and shows about 15 hours to the September 25, 4:00pm ET deadline. It requires at least one accessible GitHub, demo, or video link. No public link, deployment, or submission was made.
- Committed the market-read update, readiness docs, and token-exposure explanation on local `main`. The working tree is clean; these commits have not been pushed or made public.

### Saved-company market checks — September 25, 2026

- Added an in-app watchlist monitor for up to five saved companies. It checks immediately, refreshes every ten minutes while the Research tab is open, and refreshes again when the tab becomes visible. A manual refresh is also available.
- Each check reuses the same disclosed market-quality rules as the Catalyst Monitor and fetches current catalogue quote/mark data with pool liquidity, 24-hour volume, and the latest completed daily close. The sidebar shows the first flag or “No major data flags”; failures remain explicit.
- This makes the “what changed?” workflow continue across saved companies without claiming that a threshold is a trading signal. It remains browser-local and does not send notifications when Vestra is closed. Telegram was not added: a dependable bot workflow needs user/chat linking and persistent delivery infrastructure that this submission does not have.
- Updated the README, pitch, and submission copy to state the refresh interval and foreground-only limitation. The main multi-agent Bull/Bear/Neutral/Council debate remains unchanged.
- The code has not yet been rechecked in the running browser or committed. Next: run lint/build, verify a saved asset receives a market-check row in the local demo, update the checklist, then commit locally. No push, deployment, or submission has been made.

#### Verification update — September 25, 2026 (04:54 UTC)

- `npm run build` passed after adding the watchlist monitor. `npm run lint` initially caught a React effect rule; the initial refresh was moved to a scheduled callback, after which `npm run lint` and `git diff --check` passed.
- Browser verification saved Anthropic from the current Research screen. The new sidebar monitor fetched the same mint’s quote, reference mark, pool liquidity/volume, and last completed close and displayed “No major data flags” with its check time. The first request returned a temporary upstream 502; manual refresh succeeded with HTTP 200 and the row updated. This confirms both visible error handling and recovery on one asset.
- The screenshot review shows the monitor fits into the existing compact sidebar in the current mobile viewport. It checks at most five saved symbols to bound upstream requests, checks every ten minutes while open, and does not run in the background.
- No Telegram bot integration was added. Without user/chat linking and a persistent delivery service, Telegram notifications would not be reliable; current copy describes the feature as an in-app monitor and explicitly excludes push alerts.
- Final lint and production-build verification both pass after the last adjustment. At that verification point, the code was not committed; no deployment, push, public access change, or submission had happened.

#### Commit record — September 25, 2026 (04:55 UTC)

- Committed the monitor, shared market-quality helper, and related pitch/submission notes as `44d626e Add saved company market checks` on local `main`. The worktree is clean and `main` is 46 commits ahead of `origin/main`; nothing was pushed or published.
- Final `npm run lint`, `npm run build`, and `git diff --check` all pass. The browser showed Anthropic’s successful refreshed status after a temporary upstream error.
- Remaining submission blocker: there is still no judge-accessible GitHub, live demo, or video link. GitHub is private and Vercel is unlinked. The Stocklana form also needs the owner’s team details and connected account/wallet. No public release or submission was made.

### Quote movement since last check — September 25, 2026 (05:02 UTC)

- Extended the saved-company market monitor to compare the current PreStocks quote with the previous check for that symbol. It reports a signed percent move above 0.5%, or says the quote is steady below that threshold; a first successful check builds the local baseline.
- Snapshots stay in the current browser’s local storage and are not sent to Vestra’s server. UI and pitch copy say so. The feature does not run when the app is closed and sends no Telegram/push messages.
- In the browser, Anthropic displayed “No major data flags” and “Quote -2.98% since last check.” The market endpoint had successful data, and the mobile-width sidebar remained readable. This verifies the comparison path against one live asset; the move is a point-in-time observation, not a prediction.
- `npm run lint`, `npm run build`, and `git diff --check` passed after this change. Local changes are not yet committed; no public release or form submission has occurred.

#### Follow-up commit — September 25, 2026 (05:03 UTC)

- Committed the browser-local quote comparison and its pitch/submission wording as `833f400 Show quote movement in saved market checks`. Local `main` is 48 commits ahead of `origin/main`; the worktree is clean.
- The event page still says submissions close September 25 at 4:00pm ET, about 15 hours from the latest page check. It requires at least one accessible GitHub, live demo, or video link. Vestra still has none: GitHub is private and this checkout has no Vercel project link. The final route and submitter/team details remain for the owner to choose; no push, public deploy, or submission has occurred.

### Production configuration and missing-key route — September 25, 2026 (05:06 UTC)

- Checked `.env.local` without printing values: `GEMINI_API_KEY` is set; `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, and `RATE_LIMIT_HASH_SALT` are unset. Production debates will remain fail-closed until the owner provisions Upstash and enters the three values in Vercel’s private environment settings.
- A separate no-key dev server could not bind to another localhost port in the current sandbox (`EPERM`). To avoid touching the real Gemini key or consuming its quota, I invoked the production-built debate handler directly in a process with `GEMINI_API_KEY` unset. It returned HTTP 503 `MISSING_KEY` with the intended setup message and made no provider call. The existing browser code maps non-OK API messages into the visible retry alert; forced visual error-state testing remains open.
- The installed Vercel CLI printed its version but returned no identity/project listing in the latest command calls, so those calls did not reconfirm account access. The authoritative local state is unchanged: this checkout has no `.vercel` link and no deployment.

### Code-only GitHub push — September 25, 2026 (06:58 UTC)

- The user explicitly authorized pushing to GitHub and asked to keep Markdown/supporting documents out. I fetched `origin/main` (`f63b20c`), staged only app code, runtime configuration, the lockfile, and the two images used by the running UI. The staged file audit found no `.md`, `.mdx`, `.html`, or `submission-assets/` paths, and a limited scan found no common API-key/private-key patterns.
- Lint and production build passed on the code-only tree. GitHub accepted commit [`c1ba1d9`](https://github.com/Shawnchee/Vestra/commit/c1ba1d9) as a fast-forward of `main`. The remote main was fetched afterward and confirmed at this commit.
- Updated pitch/report Markdown, submission HTML, and generated submission card were excluded from the push and retained in the local workspace. The prior full local history is preserved at `backup/vestra-main-with-docs-20260925`. Local `main` now tracks the pushed code commit; local documentation remains uncommitted by request.
- The repository is still private, so the GitHub link is not judge-accessible. No Vercel project, public demo, or hackathon form submission exists yet. Live debate production still needs a fresh Gemini key and the three Upstash values in private Vercel settings.


## Current handoff — September 25, 2026

This section supersedes earlier point-in-time notes below that say the docs were unpushed or the app was not on GitHub. Earlier entries remain as a work history.

- The app and the pitch, submission, deployment, checklist, product, and review documents are being committed to `main` and pushed to `https://github.com/Shawnchee/Vestra`. The repo visibility has not been freshly confirmed; provide judges a public demo/video link or confirm repo access before using it in the entry.
- Current product flow: PreStocks catalogue details and token/mark prices → company-linked headlines → Bull, Bear, and Neutral analyses → Council evidence check and summary → optional two-voice audio brief → same-mint Solana pool replay and illustrative 5/20-day simulation.
- PreStocks product tokens provide economic exposure under its terms, not ownership rights in the referenced companies. The pool replay is separate from the catalogue quote and must not be pitched as PreStocks historical returns.
- Local app build and audio route were verified before this limiter change. Hosting configuration remains outside this checkout; a judge-accessible demo requires a deployment with the Gemini key configured. No Stocklana form submission has been made.
- The latest live event page check listed the deadline as Friday September 25, 2026 at 4:00pm ET, about 13 hours from the check, and required one accessible GitHub/demo/video link. Recheck the [official Stocklana page](https://hackathons.solana.com/hackathons/stocklana) before submitting.

### Public hackathon deployment choice

- At the user's request, removed the Upstash rate-limit check from debate and audio routes. The public demo now relies on Gemini project quotas/provider limits; the Gemini key remains server-side. Existing same-origin checks, request-size validation, timeouts, and provider error responses remain in place.
- Removed Upstash settings from `.env.example`, README, and current Vercel deployment instructions; deleted the unused limiter implementation. No code-level abuse limiter remains, so Gemini usage should be monitored and the key rotated or disabled if usage is unexpected.
- This supersedes earlier notes in this historical report that say production requires Upstash or fails closed without it.

# Stocklana submission draft

## Project

**Name:** Vestra

**One-liner:** Vestra brings PreStocks company news and token data together, lets Bull, Bear, and Neutral examine the same evidence, then gives you a Council summary you can read or hear.

## Project description

Researchers in PreStocks have to piece together a private company’s news, its PreStocks quote, and its on-chain market from separate pages. That makes it hard to compare opposing readings of the same headline or see what the token did around it.

Vestra brings that work into one research desk for companies in the PreStocks catalogue. It uses the catalogue’s description, issuer profile, image, mint, token price, mark price, implied valuation, mark valuation, and supply. Its Catalyst Monitor links company headlines to the selected token’s latest completed pool close, liquidity, and 24-hour volume, alongside the PreStocks quote and reference mark. A market-read check flags large price gaps, low activity, and stale closes, while making clear that the checks cannot establish fair value or guarantee exit liquidity. It keeps headlines that name the company or come from its publisher in the AI evidence packet; broader stories remain visible but are excluded from the debate.

Three Gemini analysts read the same server-fetched source packet in parallel: a bull makes the upside case, a bear tests the risks, and a neutral analyst separates direct statements from unknowns. A Council chair reviews their arguments against the headlines and summarizes the evidence and uncertainties. Supported claims link to the publisher. A live node graph shows each stage as it finishes, and an optional two-voice audio brief reads the Council’s existing summary.

Market replay follows the selected PreStocks mint to a Solana USDC pool. Users can inspect daily prices in LuxAlgo Vela, compare closes around a dated headline, and explore a sample 5/20-day moving-average strategy with adjustable costs beside buy-and-hold.

Saved companies also receive an in-app check every ten minutes while Vestra is open. It shows the PreStocks quote change since the prior browser-local check and flags quote gaps, low pool activity, or stale closes for follow-up. It does not send background or Telegram alerts.

Solana is where these PreStocks tokens and pools trade, so Vestra follows the exact on-chain mint instead of substituting unrelated equity or FX data. Pool prices are separate from PreStocks quotes and are not a PreStocks return series. Crypto headlines stay separate from company evidence. The app is read-only and never trades.

## Track selection

- Main Track
- PreStocks — Best Use of PreStocks

Vestra selects only assets returned by the PreStocks catalogue and does not integrate other pre-IPO tokens.

The current Stocklana page lists a $100,000 Main Track prize pool and a $10,000 PreStocks bounty with three awards ($5,000, $3,000, and $2,000). The PreStocks bounty is the closest fit because Vestra uses the PreStocks catalogue and the exact selected mint throughout.

## Live AI check before recording

One fresh browser run completed all four roles: Bull, Bear, Neutral, and Council. The Bear model hit a temporary provider error and the app disclosed that its configured fallback answered. Run a fresh debate before recording; provider capacity can change. The Council model can be overridden with `GEMINI_COUNCIL_MODEL`. Watchlist checks run only while the tab is open; there are no Telegram or background notifications.

## Links and team

- GitHub: https://github.com/Shawnchee/Vestra — `main` contains the app and submission materials. Check repository access before using it as the judge link; private repositories are not accessible to judges.
- Live demo: add the public deployment URL after deploying.
- Demo video: optional; record and add an unlisted video URL if available.
- Team: add the submitter and collaborator names/links in the form.

Stocklana requires at least one accessible GitHub, live demo, or video link. The repository push does not make it public. At the time this draft was prepared, no public demo or video link was available and no form had been submitted. Check [DEPLOYMENT.md](./DEPLOYMENT.md) for the remaining hosting steps.

The official submit page currently requires sign-in and a connected wallet before the form can be opened. Choose the account/wallet for the team and ensure the selected project link is accessible to judges before submitting. The event page lists the deadline as Friday, September 25, 2026 at 4:00pm ET (September 26 at 4:00am Kuala Lumpur time). Recheck the [official page](https://hackathons.solana.com/hackathons/stocklana) for the live countdown.

## Demo script (2 minutes 50 seconds)

- **0:00–0:20:** “Vestra connects PreStocks company news to Solana pool conditions, then lets four AI roles debate the same headlines.” Show the Research view.
- **0:20–0:45:** Vestra opens on Anthropic PreStocks. Point out the token quote and reference mark, the latest pool close, volume, and the market-read flags. The readings change; a clean check does not prove fair value.
- **0:45–1:25:** Choose a company-linked headline. Start the debate and show Bull, Bear, and Neutral working in parallel before Council weighs their cases. Follow a citation to the publisher. If Gemini is busy, continue to Market replay without claiming a completed readout.
- **1:25–2:00:** Open Market replay. Show that the chart uses the same company token selected in Research. Point to the Vela chart, liquidity, and volume. Select a dated headline and inspect nearby prices.
- **2:00–2:30:** Expand the strategy simulation. Explain that it compares average pool prices over 5 and 20 days, acts at the next available daily open, and includes adjustable costs and drawdown. These are discovered-pool results, not PreStocks returns.
- **2:30–2:50:** Play the Council audio brief, or show the SpaceX lifecycle notice. Close: “Vestra helps me see the company story, what each side thinks, and where the evidence is still thin.”

## Disclosures

Vestra is a research tool, not an investment adviser or trading system. PreStocks tokens provide economic exposure under their product terms; they are not direct company shares. The app uses Gemini-generated analysis, Google News RSS headline metadata, CoinDesk RSS crypto context, PreStocks catalogue data, GeckoTerminal pool data, and LuxAlgo Vela charting. Headline-to-price movement is descriptive and does not establish causation.

Stocklana asks each team to include at least one judge-accessible GitHub, live demo, or video link. Confirm that the chosen link opens without special access, then invite teammates and submit before the deadline shown on the [official event page](https://hackathons.solana.com/hackathons/stocklana).

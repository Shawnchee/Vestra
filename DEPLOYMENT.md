# Vestra deployment handoff

The current `main` branch includes the app and its pitch/submission materials. This checkout is not linked to a hosting project, so there is no public demo URL yet. Before a public deployment, rotate the Gemini key that was shared in chat and configure a fresh key and the Upstash values below in private hosting settings.

## Before connecting a host

1. Choose a judge link. The GitHub repo can stay private if a public deployment or demo video is provided; judges need at least one accessible link.
2. Create an Upstash Redis database for the debate request limits.
3. In the host’s private environment-variable settings, add the variables below. Do not put real values in this file, `.env.example`, source code, or chat.

| Variable | Required | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | Yes for live debate | Server-side Gemini access. Use a newly rotated key. |
| `NEXT_PUBLIC_SITE_URL` | Recommended on non-Vercel hosts | Public origin used to build Open Graph and Twitter preview URLs. Vercel's `VERCEL_URL` is used automatically when this is unset. |
| `GEMINI_MODEL` | Recommended | Primary model; current default is `gemini-3.5-flash-lite`. |
| `GEMINI_FALLBACK_MODEL` | Recommended | One retry after temporary provider errors; default is `gemini-3.1-flash-lite`. |
| `GEMINI_TTS_MODEL` | Optional | On-demand Council audio; defaults to `gemini-3.8-flash-lite-tts` and uses the same Gemini key. |
| `GEMINI_COUNCIL_MODEL` | Optional | Final synthesis model; defaults to stable `gemini-3.8-flash`. `gemini-3.1-pro-preview` is an optional paid Preview model. |
| `GEMINI_BULL_MODEL`, `GEMINI_BEAR_MODEL`, `GEMINI_NEUTRAL_MODEL` | Optional | Override individual analyst models; see `.env.example`. |
| `UPSTASH_REDIS_REST_URL` | Yes for production debate | Redis REST endpoint for shared request limits. |
| `UPSTASH_REDIS_REST_TOKEN` | Yes for production debate | Private Redis REST token. |
| `RATE_LIMIT_HASH_SALT` | Yes for production debate | Private random value, at least 32 characters, used to HMAC-hash client IP identifiers. |

Optional model overrides are documented in `.env.example`. Add settings to Production and any Preview environment you intend to share. The production debate route fails closed until all three Upstash values are present.

## Connect and deploy

1. Connect the existing repository to a Next.js hosting project. `main` contains the current app and documentation. No Vercel project is linked in this checkout yet.
2. Set the environment variables above in the host dashboard.
3. Build with `npm run build`, deploy, and open the resulting URL in a private browser window to confirm judges can access it without signing in.
4. Confirm Research loads PreStocks prices and headlines; the market-read flags match the visible quote, mark, pool activity, and close date; Market replay loads the selected mint’s pool chart; CoinDesk context and the strategy panel open; and Bull, Bear, Neutral, and Council finish a live debate.
5. If any demo-critical check fails, keep the disclosure visible and use the existing retry state. Do not claim generated analysis that did not complete.
6. Put the publicly accessible deployment URL in the Stocklana entry. A public GitHub link or video can be used instead if deployment is unavailable.

No hosting account or project is linked in this checkout yet. No deployment has been created from it.

## Vercel setup notes

Vercel CLI is installed. The latest identity and filtered-project commands returned no account details, so access could not be reconfirmed. This folder has no `.vercel` project link; none was created, and no deployment has been started.

This is a standard Next.js app. Vercel documents Next.js as zero-configuration: select the repository root as the project root and leave the Next.js framework, build, install, and output settings on automatic detection. `package-lock.json` selects npm. The equivalent local checks are `npm ci` and `npm run build`; both passed in this checkout. No `vercel.json` is needed for the current app. The debate route already sets `maxDuration = 60`; keep the deployed function duration at 60 seconds or higher. Vercel's current docs permit that value on Hobby. See [Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs) and [function duration limits](https://vercel.com/docs/functions/configuring-functions/duration).

### Add environment variables in the Vercel dashboard

Set these as private, server-side values for **Production** and for **Preview** if a preview will be shown to judges:

- `GEMINI_API_KEY` — use a newly rotated key for the public demo; do not reuse the current local key or expose it with a `NEXT_PUBLIC_` prefix.
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `RATE_LIMIT_HASH_SALT` — a private random value of at least 32 characters.

Recommended model settings are `GEMINI_MODEL=gemini-3.5-flash-lite` and `GEMINI_FALLBACK_MODEL=gemini-3.1-flash-lite`. Role-specific overrides and `NEWS_MAX_RECORDS` are optional. Do not set `NEXT_PUBLIC_SITE_URL` to `localhost` in Vercel; `src/app/layout.tsx` already uses Vercel's generated deployment URL when no explicit public site URL is configured. Vercel makes newly added variables available on a new deployment, so redeploy after setting them. See [Vercel environment variables](https://vercel.com/docs/environment-variables).

### After linking the project

1. Choose an existing Vercel project or create a new one in the authenticated account, then link this repository root. If using Git integration, deploy the current `main` branch.
2. Add the server-side environment variables above without placing values in the repository or chat.
3. Build a Preview deployment first and check its access in a logged-out/private browser window. Vercel deployment protection can make preview links require authentication; judges need an unauthenticated route or a valid shareable link. See [Deployment Protection](https://vercel.com/docs/deployment-protection).
4. Exercise Research, live four-role debate, the same-token Market replay, CoinDesk context, and the strategy panel on the deployed URL. Confirm the production rate limit is configured before relying on debate generation.
5. Use the checked, judge-accessible deployment URL in the Stocklana form only after the owner chooses to publish and submit.

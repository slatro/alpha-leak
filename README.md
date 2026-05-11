# Alpha Leak

Alpha Leak is a private alpha discovery engine prototype. The frontend still renders as a lightweight web app, but auth/profile/watchlist now have a real backend-ready API layer for Vercel deployment.

## Run

Static preview only:

```sh
python3 -m http.server 4173
```

Full auth + backend preview:

```sh
npm install
npx vercel dev
```

Open `http://127.0.0.1:4173`.

## Structure

- `index.html` defines the application shell.
- `src/data.js` contains mock opportunities and smart-wallet records in future API-shaped objects.
- `src/app.js` owns rendering, UI state, analyzer search, and client-side API orchestration.
- `src/styles.css` contains the production UI system and responsive layout.
- `api/` contains Vercel serverless functions for wallet auth, profile persistence, and watchlist persistence.
- `db/schema.sql` defines the persistent backend tables.

## Future API Boundaries

The mock records are intentionally grouped around the feeds Alpha Leak will need later:

- X intelligence: official accounts, founders, researchers, collectors, account quality, mention velocity, bot rate, influencer shill status.
- Wallet intelligence: early entries, wallet type, copy risk, confirmation strength.
- Crowd intelligence: Discord size and velocity, tutorial density, saturation status.
- Market and mint intelligence: liquidity, floor, volume spikes, mint velocity, testnet or quest state.

## Backend Environment

Production expects:

- `SESSION_SECRET`
- either:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

If Supabase is not configured, API routes fall back to a local `/tmp` JSON store for development only.

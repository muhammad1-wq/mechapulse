# MechaPulse — Full-Stack Robotics/AI Platform

A real, working full-stack app: Express + JSON-file datastore backend, React (Vite) frontend.
Not a mockup — auth, passwords, uploads, orders, and subscriptions are genuinely persisted
and validated server-side.

## What's actually real vs. what's stubbed

**Real:**
- Account creation & login (bcrypt-hashed passwords, JWT sessions, 7-day expiry)
- Server-side password strength validation (8–16 chars, upper/lower/number/symbol)
- Change email / password, gated behind your current password
- Avatar upload (stored on disk, served back over HTTP)
- Orders (Buy page) — persisted per user, then opens a real marketplace search
  (Amazon / Daraz / AliBaba) for that robot
- Subscriptions (subscribe/unsubscribe) — persisted per user
- Article "read" tracking that feeds a live reader-interest chart
- All dashboard charts pull from real API endpoints (not hardcoded arrays)

**Intentionally stubbed** (can't be made real without accounts/infra you'd need to own):
- **Google / Apple sign-in** — real OAuth requires registering an app with each
  provider and a live HTTPS redirect domain. The backend has a documented
  `/api/auth/oauth/:provider` route ready to wire up real credentials into
  (see `server/server.js`), but clicking these buttons in the demo shows an
  honest "not configured" message instead of pretending to log you in.
- **Actual checkout on Amazon/Daraz/AliBaba** — you don't have merchant
  agreements with them; "Buy" opens their real search results for the robot
  so the user can complete checkout there themselves. This is the honest
  version of a marketplace affiliate flow.
- **Actual Claude/Gemini/GPT-5 billing** — subscribing here creates a record
  in *this* app; it doesn't call Anthropic/Google/OpenAI's billing APIs
  (those require your own merchant/business accounts with each company).

## Project structure

```
mechapulse-fullstack/
  server/          Express API (auth, data, uploads)
    server.js
    db.js          Pure-JS JSON file datastore (no native deps to install)
    uploads/        avatar images land here
  client/          React + Vite frontend
    src/App.jsx     all pages/components
    src/api.js      fetch wrapper for the backend
```

## Running it locally

**1. Backend**
```bash
cd server
npm install
npm start
# → MechaPulse API listening on http://localhost:4000
```

**2. Frontend** (separate terminal)
```bash
cd client
npm install
npm run dev
# → open http://localhost:5173
```

The frontend talks to `http://localhost:4000` by default. To point it elsewhere,
set `VITE_API_URL` in a `client/.env` file:
```
VITE_API_URL=https://your-api-domain.com
```

## Data storage

User accounts, orders, subscriptions, and article-read events are stored in
`server/mechapulse.json`, written synchronously on every change — delete
that file to reset the app to a clean state. Avatars are saved to
`server/uploads/`.

## Making Google/Apple sign-in real

1. Register OAuth apps in the Google Cloud Console and Apple Developer portal.
2. Get a real client ID/secret and a live redirect URL for each.
3. Replace the stub in `server/server.js` (`/api/auth/oauth/:provider`) with
   the provider's token-exchange flow, then issue your own JWT the same way
   `/api/auth/login` does.
4. Update the "Google"/"Apple" buttons in `client/src/App.jsx` to redirect to
   the provider's consent screen instead of calling the stub.

## Security notes for going to production

- Set a strong, random `JWT_SECRET` via environment variable (never the default).
- Swap the JSON file store for a real database (Postgres, etc.) once you
  have concurrent users — it's a thin `db.js` module, so this is a
  contained change.
- Serve over HTTPS and set `secure`/`httpOnly` cookies instead of a bearer
  token in `localStorage` if you want stronger XSS protection.
- Add rate limiting to `/api/auth/login` and `/api/auth/register`.

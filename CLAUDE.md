# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ToernooiProf is a Dutch-language Next.js 16 full-stack application for managing billiards tournaments. It supports multi-organization tenancy where each organization manages its own tournaments, players, matches, and standings.

**Live domains**: biljart.club, toernooiprof.biljart.app

## Commands

- `npm run dev` — Start dev server (webpack mode, suppresses deprecation warnings)
- `npm run build` — Production build
- `npm run lint` — ESLint
- `npm run test:security` — Run security tests (`node --test tests/security/**/*.test.js`)
- `npm run version:bump` — Bump patch version

Production build with build ID (used in deployment):
```
export NEXT_PUBLIC_BUILD_ID=$(TZ=Europe/Amsterdam date +%d%m%y-%H%M) && npm run build
```

## Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19, TypeScript 5
- **Styling**: Tailwind CSS 4
- **Database**: Firebase Firestore (falls back to local `.data/*.json` files when no Firebase credentials)
- **Auth**: Signed HTTP-only session cookies (HMAC-SHA256), no Firebase Auth
- **Hosting**: Firebase App Hosting on Cloud Run
- **Rate limiting**: Upstash Redis (optional)
- **Bot protection**: Cloudflare Turnstile (optional)
- **Backups**: Google Cloud Storage

## Architecture

### Base Path
All routes are served under `/toernooiprof` base path (configured in `next.config.ts`). The `src/lib/api.ts` fetch wrapper prepends this automatically.

### Route Groups
- `src/app/(auth)/` — Login, register, email verification (public)
- `src/app/(dashboard)/` — Protected pages: tournament management, settings, admin
- `src/app/api/` — 64+ API endpoints

### API Route Pattern
Routes follow REST convention: `/api/organizations/[orgNr]/competitions/[compNr]/...`
Auth is enforced per-route using helpers from `src/lib/auth-helper.ts`:
- `validateOrgAccess()` — Ensures session org matches requested org
- `validateSuperAdmin()` — Checks admin whitelist

### Database Layer (`src/lib/db.ts`)
Abstraction over Firestore with a Firestore-like API. Automatically switches to local JSON files (`.data/`) when Firebase credentials are absent, enabling offline development without Firebase setup.

### Session Management (`src/lib/session.ts`)
Cookie name: `toernooiprof-session`. Format: `v1.{base64url-payload}.{hmac-signature}`. Contains `orgNummer`, `orgNaam`, `loginTime`, `verified`. Max age: 12 hours.

### Key Domain Concepts
- **Organization** (`org_nummer`) — A club that hosts tournaments
- **Tournament/Toernooi** (`t_nummer`) — A competition event with discipline and scoring rules
- **Poule** — Group of players within a tournament
- **Uitslag** — Match result
- **Gebruiker** — Registered player
- **Discipline** — Game type (Libre, Bandstoten, Driebanden, etc.)
- **Points systems**: WRV (2-1-0), 10-punten, Belgisch

### Contexts
- `AuthContext` — Session state and login/logout actions
- `ThemeContext` — Dark/light mode (persisted in localStorage as `toernoiprof-theme`)
- `TournamentContext` — Active tournament state

## Language

The application UI, variable names, and database fields use Dutch. Key translations:
- toernooi = tournament, uitslag = result, gebruiker = user
- poule = group, spelronde = round, organisatie = organization
- beurt/beurten = turn(s), carambole = carom (billiards term)

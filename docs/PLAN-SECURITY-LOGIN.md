# Plan: Beveiliging tegen ongewenste logins

**Status:** Goedgekeurd – Fase 1 t/m 4 geïmplementeerd  
**Referentie:** `docs/SECURITY-LOGIN-IMPLEMENTATION.md`

---

## Doel

Meerdere lagen combineren (preventie + detectie + mitigatie) en alles server-side afdwingen:
- Rate limiting + progressive delay + cooldown op auth-endpoints
- Geen account-enumeratie (generieke foutmeldingen)
- Bot-challenge (Turnstile) na verdachte pogingen
- Privacy-bewuste auth-logging
- Optioneel: sessie-aanscherping, MFA

---

## Fase 1 — Rate limiting (S1–S4)

### S1: Rate limiting-infrastructuur
- [x] Upstash Redis toevoegen: `@upstash/ratelimit` en `@upstash/redis` (of alleen `@upstash/ratelimit` als Redis URL wordt ondersteund).
- [x] Env: `UPSTASH_REDIS_REST_URL` en `UPSTASH_REDIS_REST_TOKEN` (of documentatie in README).
- [x] Nieuwe lib `src/lib/rateLimit.ts`:
  - Helper(s) voor: per-IP limiet, per-identifier limiet (e-mail of code-prefix).
  - Optioneel: progressive delay (na N failures extra wachttijd) en cooldown (429 + Retry-After).
  - Fallback als Redis niet geconfigureerd: in development geen rate limit of alleen in-memory (duidelijk loggen).
- [x] Geen wijzigingen aan auth-routes in S1; alleen infra klaarzetten.

### S2: Rate limit op login-code
- [x] In `src/app/api/auth/login-code/route.ts`: vóór Firestore-query rate limit check.
  - Limiet: bijv. 10 per IP per 15 min, 5 per code-prefix (eerste 4 cijfers van `code`) per 15 min.
  - Bij overschrijding: 429, `Retry-After` header, body `{ error: "Te veel pogingen. Probeer over X minuten opnieuw." }`.
  - Identifier voor cooldown: IP + code-prefix (alleen bij mislukte poging tellen; bij succes geen lock).
- [x] Generieke foutmelding behouden voor ongeldige code (geen enumeratie).

### S3: Rate limit op Firebase login
- [x] In `src/app/api/auth/login/route.ts`: rate limit per IP (bijv. 20 per 15 min) vóór tokenverificatie.
  - Bij overschrijding: 429 + Retry-After + generieke fout.
  - Optioneel: progressive delay na N mislukte token/org-checks (als je failures per IP bijhoudt).
- [x] Geen wijziging aan client-side Firebase-aanroep; alleen server-endpoint beschermen.

### S4: Rate limit op register en verify
- [x] `src/app/api/auth/register/route.ts`: limiet bijv. 5 per IP per 15 min, 3 per e-mail per uur. Bij overschrijding 429 + Retry-After.
- [x] `src/app/api/auth/verify/route.ts`: limiet bijv. 5 per IP per 15 min, 5 per e-mail per 15 min. Bij overschrijding 429 + Retry-After.

---

## Fase 2 — Geen enumeratie (S5)

### S5: Generieke foutmeldingen
- [ ] **Client** `src/app/(auth)/inloggen/page.tsx`:
  - Alle Firebase Auth-foutcodes (`auth/user-not-found`, `auth/wrong-password`, `auth/invalid-credential`, etc.) → één melding: **"Onjuiste inloggegevens."**
  - Alleen `auth/invalid-email` mag apart blijven (formaatfout), en `auth/too-many-requests` / `auth/user-disabled` kunnen specifiek blijven (geen enumeratie van “bestaat account”).
- [ ] **Server** `src/app/api/auth/login/route.ts`:
  - Bij geen organisatie voor e-mail: status **401** (niet 404), body `{ error: "Onjuiste inloggegevens." }` (zelfde als bij ongeldige token).
  - Geen "Geen organisatie gevonden voor dit e-mailadres".
- [ ] **Server** `src/app/api/auth/login-code/route.ts`:
  - Blijft generiek "Ongeldige inloggegevens." of "Ongeldige inlogcode. Probeer het opnieuw." (één vaste string); waar mogelijk gelijke response-timing (kleine vertraging bij “niet gevonden” mag).
- [ ] **Server** `src/app/api/auth/register/route.ts`:
  - Bij bestaand e-mail: generieke melding bijv. "Als dit e-mailadres nog niet is geregistreerd, ontvang je een e-mail." Status 400 of 401; geen "E-mail bestaat al".
- [ ] **Server** `src/app/api/auth/verify/route.ts`:
  - Bij geen account of ongeldige code: één generieke melding "Ongeldige of verlopen verificatie." Status 401; geen "Geen account gevonden met dit e-mailadres".

---

## Fase 3 — Bot-challenge (S6)

### S6: Turnstile na verdachte pogingen
- [x] Cloudflare Turnstile: site key + secret key (env `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`).
- [x] Login-pagina: Turnstile-widget conditioneel tonen (bijv. na 3 mislukte pogingen, of als backend `requiresChallenge: true` teruggeeft). Token meesturen bij volgende login-request.
- [x] `POST /api/auth/login-code` en `POST /api/auth/login`: als challenge vereist (bijv. na N failures per IP), token verplicht; server verifieert token bij Cloudflare. Bij ontbreken/ongeldig: 400 of 429 met generieke fout.
- [x] Nieuwe util bijv. `src/lib/turnstile.ts`: `verifyTurnstileToken(token: string): Promise<boolean>`.

---

## Fase 4 — Logging (S7)

### S7: Auth-logging naar Cloud Logging (privacy-bewust)
- [x] Nieuwe `src/lib/authLog.ts`: functie `logAuthEvent({ endpoint, identifier?, success, ip?, userAgent? })`.
  - IP en identifier alleen gehasht of verkort (geen plaintext e-mail/code in logs).
  - Log naar **Google Cloud Logging** (niet console); gebruik `@google-cloud/logging` of gestructureerde stdout voor GCP-ingest.
- [x] Aanroepen in: `login-code`, `login`, `register`, `verify` (en optioneel `logout`) bij success en bij failure.

---

## Fase 5 — Optioneel later

### S8: Sessie-rotatie en cookie-aanscherping
- [ ] Sessie-cookie roteren na elke succesvolle login (nieuwe waarde/sessionId).
- [ ] Optioneel: kortere cookie TTL + refresh via `/api/auth/session`.

### S9: MFA (TOTP) optioneel
- [ ] TOTP-setup en verificatie na login; optioneel per organisatie; Firestore-velden voor MFA-status en (encrypted) secret.

### S10: MFA verplicht voor admins
- [ ] Beleid + check in login-flow; alleen uitvoeren na S9.

---

## Goedkeuring

- [X] **Ik keur dit plan goed.** Fase 1 t/m 4 (S1–S7) mogen worden geïmplementeerd. Fase 5 (S8–S10) blijft optioneel voor later.

**Na goedkeuring:** implementatie door de coding agent volgens de bovenstaande fasen (S1 → S2 → S3 → S4 → S5 → S6 → S7). Bij wijzigingen in env (Upstash, Turnstile) README of `.env.example` bijwerken.

---

*Plan aangemaakt voor ClubMatch; referentie: SECURITY-LOGIN-IMPLEMENTATION.md*

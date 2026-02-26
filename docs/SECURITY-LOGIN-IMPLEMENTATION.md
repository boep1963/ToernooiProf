# Implementatieplan: Voorkomen van ongewenste logins

Dit document vertaalt het beveiligingsvoorstel naar de **concrete auth-stack van ClubMatch** en splitst het op in implementeerbare backlog-features.

---

## Huidige auth-stack (samenvatting)

| Onderdeel | Technologie | Endpoints / plek |
|-----------|-------------|-------------------|
| **Legacy login** | Eigen validatie tegen Firestore `organizations.org_code` | `POST /api/auth/login-code` |
| **E-mail/wachtwoord** | Firebase Auth (client) + tokenverificatie (server) | Client: `signInWithEmailAndPassword` → Server: `POST /api/auth/login` (idToken) |
| **Registratie** | Firestore + e-mailqueue + verificatiecode | `POST /api/auth/register`, `POST /api/auth/verify` |
| **Sessie** | Cookie `clubmatch-session` (HttpOnly, Secure, SameSite=lax, 7 dagen) | `GET /api/auth/session`, `POST /api/auth/logout` |
| **Wachtwoord reset** | **Niet aanwezig** in codebase | — |

**Opmerking:** Wachtwoordhashing doet Firebase Auth; login-code is een shared secret (geen wachtwoord). Rate limiting en lockouts ontbreken nu overal.

---

## 1. Rate limiting (server-side)

**Doel:** Brute-force en credential stuffing duur maken.

**Plekken:**
- `src/app/api/auth/login-code/route.ts` — per IP + per code-prefix/identifier
- `src/app/api/auth/login/route.ts` — per IP + per e-mail (uit idToken na verificatie, of uit request body vóór Firebase-call indien je eerst rate limit wilt)
- `src/app/api/auth/register/route.ts` — per IP
- `src/app/api/auth/verify/route.ts` — per IP + per e-mail
- Eventueel toekomstige wachtwoord-reset endpoint — per IP + per e-mail

**Implementatie:**
- **Store:** Redis/Upstash (serverless-safe). Geen memory-store i.v.m. meerdere instances.
- **Middleware vs route handler:** Rate limit in de route handlers (of in een gedeelde helper die je in elke route aanroept), zodat je bij login-code/e-mail de juiste identifier hebt.
- **Limieten (voorbeeld):**
  - Login-code: bijv. 10 pogingen per IP per 15 min, 5 per “code-prefix” (eerste 4 cijfers) per 15 min.
  - Firebase login: na `signInWithEmailAndPassword` faalt, komt de request op `/api/auth/login` niet; rate limit dus vooral **client-side** (Firebase doet al iets) + evt. een **algemene** limiet op `/api/auth/login` per IP (bijv. 20/15min) om misbruik van gestolen tokens te beperken.
  - Register/verify: bijv. 5 per IP per 15 min, 3 per e-mail per uur.

**Progressive delay:** Na N mislukte pogingen (bijv. 5) extra wachttijd (2s, 5s, 10s) vóór response. Sla op per IP/identifier in Redis met TTL.

---

## 2. Cooldown / lockout (zacht)

**Doel:** Geen harde lock (DoS-risico), wel “probeer over X minuten opnieuw”.

**Plekken:**
- Zelfde routes als hierboven.

**Implementatie:**
- Bij overschrijding limiet: HTTP 429 + `Retry-After` + zelfde generieke fouttekst.
- Cooldown per combinatie (bijv. IP + identifier) met TTL in Redis (bijv. 10 minuten).
- Geen wereldwijde account-lock: alleen per IP + per identifier, zodat één aanvaller niet alle users van één account blokkeert.

---

## 3. Generieke foutmeldingen (geen account-enumeratie)

**Doel:** Geen uitlekken of een account wel/niet bestaat.

**Huidige problemen:**
- **Login-code:** Melding “Ongeldige inlogcode” is al generiek; wel zorgen dat timing en response-grootte niet afwijken tussen geldig/ongeldig.
- **Firebase login (client):** In `src/app/(auth)/inloggen/page.tsx` worden nu o.a. `auth/user-not-found` en `auth/wrong-password` apart getoond → enumeratie. Vervangen door één melding: “Onjuiste inloggegevens.”
- **Firebase login (server):** `src/app/api/auth/login/route.ts` geeft bij geen org voor e-mail nu expliciet “Geen organisatie gevonden voor dit e-mailadres” (404). Aanpassen naar dezelfde generieke melding als bij tokenfout en status 401.
- **Registratie:** Bij bestaand e-mail nu specifieke fout; liever generiek: “Als dit e-mailadres nog niet is geregistreerd, ontvang je een e-mail.” (en alleen bij geldige nieuwe registratie daadwerkelijk mail sturen).
- **Verify:** “Geen account gevonden met dit e-mailadres” (404) → generiek: “Ongeldige of verlopen verificatie.” en gelijke status/response-structuur.

**Implementatie:** Eén generieke string voor alle “credential/account”-fouten, overal dezelfde status (bijv. 401) en waar mogelijk gelijke response-timing (bijv. kleine vertraging bij “niet gevonden” zodat timing niet lekt).

---

## 4. Bot-challenge (Turnstile/CAPTCHA) – risk-based

**Doel:** Challenge alleen bij verdachte signalen (beter voor UX).

**Triggers (voorbeelden):**
- Na N mislukte loginpogingen (per IP of per identifier).
- Bij (toekomstige) WAF/CDN-signalen: datacenter-IP, afwijkende geolocatie, hoge request-rate.

**Plekken:**
- Login-pagina: `src/app/(auth)/inloggen/page.tsx` — Turnstile-widget conditioneel tonen (na N failures of als backend `requiresChallenge: true` teruggeeft).
- `POST /api/auth/login-code` en `POST /api/auth/login`: indien challenge vereist, token (Turnstile) meesturen; server verifieert token bij Cloudflare (of andere provider).

**Implementatie:** Cloudflare Turnstile (of vergelijkbaar); server-side verplicht verifiëren. Geen challenge bij eerste pogingen.

---

## 5. Sessie- en cookie-instellingen

**Huidige stand:** Cookies zijn al HttpOnly, Secure (in production), SameSite=lax. Dat is goed.

**Optioneel aanscherpen:**
- Sessie-rotatie na privilege change (na eerste login na MFA, als MFA wordt toegevoegd).
- Korte TTL access token + refresh flow: nu 7 dagen; eventueel verkorten en refresh via `/api/auth/session` of aparte refresh-endpoint.

Dit kan als aparte feature(s) als je verder wilt verharden.

---

## 6. MFA (TOTP / passkeys)

**Doel:** Sterk ontmoedigen van accountovername; minimaal voor admins of risicoprofielen.

**Opmerking:** ClubMatch heeft nu één rol (organization_admin). MFA kan eerst optioneel zijn, later verplicht voor “admin” of bij nieuw device/locatie.

**Plekken:**
- Nieuwe flows: MFA-setup (TOTP of WebAuthn), MFA-check na login.
- Firestore: velden voor MFA-status, TOTP-secret (encrypted), of WebAuthn-credentials.
- Login-flow: na succesvolle login-code of Firebase login, als MFA vereist → redirect naar MFA-verificatiepagina; pas daarna sessie definitief maken.

---

## 7. Logging en alerting

**Doel:** Detectie en reactie op misbruik.

**Loggen (privacy-bewust):**
- IP (gehasht of verkort), user-agent, account-identifier (gehasht), timestamp, resultaat (success/fail), endpoint.
- Geen wachtwoorden of tokens.

**Plekken:**
- Centrale logging-helper; aanroepen vanuit `login-code`, `login`, `register`, `verify`, en evt. `logout`.
- Firestore collection of externe logging (bijv. Cloud Logging) voor analyse.

**Alerts (later):**
- Spike in failed logins; veel accounts vanaf één IP; één account vanaf veel IP’s (credential stuffing). Integratie met WAF/CDN om automatisch te blokkeren.

---

## 8. Wachtwoord-reset (toekomstig)

Als je later “wachtwoord vergeten” toevoegt:
- Rate limit en cooldown op reset-request en op reset-confirmatie.
- Generieke melding: “Als dit account bestaat, ontvang je een e-mail.”
- Geen enumeratie via timing of verschillende foutmeldingen.

---

## Vertaling naar backlog (discrete features)

Onderstaande features kunnen één-voor-één worden geïmplementeerd. Volgorde is een voorstel (rate limiting + generieke fouten eerst, daarna challenge en MFA).

| # | Feature | Korte beschrijving | Belangrijkste bestanden |
|---|--------|---------------------|-------------------------|
| **S1** | Rate limiting-infrastructuur | Redis/Upstash aanbinden; centrale rate-limit helper (per IP, per identifier, progressive delay, cooldown). | Nieuwe lib (bijv. `src/lib/rateLimit.ts`), env voor Redis-URL |
| **S2** | Rate limit op login-code | Beperk pogingen per IP en per code-prefix op `/api/auth/login-code`; 429 + Retry-After bij overschrijding. | `src/app/api/auth/login-code/route.ts` |
| **S3** | Rate limit op Firebase login | Beperk pogingen per IP op `/api/auth/login`; progressive delay na N failures. | `src/app/api/auth/login/route.ts` |
| **S4** | Rate limit op register/verify | Beperk per IP en per e-mail op `/api/auth/register` en `/api/auth/verify`. | `src/app/api/auth/register/route.ts`, `src/app/api/auth/verify/route.ts` |
| **S5** | Generieke foutmeldingen (geen enumeratie) | Eén generieke melding voor alle credential-fouten; client en server; gelijke status (401) en waar mogelijk timing. | `inloggen/page.tsx`, `login/route.ts`, `login-code/route.ts`, `register/route.ts`, `verify/route.ts` |
| **S6** | Bot-challenge (Turnstile) na verdachte pogingen | Turnstile inschakelen na N mislukte pogingen; token meesturen en server-side verifiëren. | `inloggen/page.tsx`, login-code + login route, nieuwe util voor Turnstile-verify |
| **S7** | Auth-logging (privacy-bewust) | Log IP (gehasht), user-agent, identifier (gehasht), timestamp, success/fail voor login, register, verify. | Nieuwe `src/lib/authLog.ts`, aanroepen in auth-routes |
| **S8** | Sessie-rotatie en cookie-aanscherping (optioneel) | Sessie roteren na login; evt. kortere TTL + refresh. | `login/route.ts`, `login-code/route.ts`, `session/route.ts` |
| **S9** | MFA (TOTP) optioneel | TOTP-setup en verificatie na login; optioneel per organisatie. | Nieuwe pagina’s en API’s, Firestore-velden |
| **S10** | MFA verplicht voor admins (optioneel) | Beleid: MFA verplicht voor organization_admin of bij risicoprofiel. | Beleid + check in login-flow |

---

## Aanbevolen volgorde (top 5 eerst)

1. **S1 + S2 + S3 + S4** — Rate limiting op alle auth-endpoints (infra + toepassing).
2. **S5** — Generieke foutmeldingen (grootste impact op enumeratie).
3. **S6** — Bot-challenge na verdachte pogingen.
4. **S7** — Logging (nodig voor detectie en latere alerts).
5. **S9/S10** — MFA (eerst optioneel, daarna eventueel verplicht voor admins).

Daarna: S8 (sessie/cookie) en eventueel WAF/CDN-regels + alerting (buiten Next.js).

---

## Technische notities

- **Firebase `auth/too-many-requests`:** Firebase doet al enige rate limiting op e-mail/wachtwoord. Server-side rate limit op `/api/auth/login` beschermt vooral tegen misbruik van tokens en tegen clients die de Firebase-limiet omzeilen.
- **Login-code:** Geen wachtwoordhashing; code is geheim. Focus = rate limit + cooldown + generieke fout.
- **Redis/Upstash:** Bij serverless (Vercel e.d.) is een externe store nodig; Upstash Redis past goed bij serverless.

Als je wilt, kunnen deze items als aparte features in je backlog worden gezet (handmatig of via je feature-tool). De coding agent kan ze dan één voor één implementeren volgens dit plan.

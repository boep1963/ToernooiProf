# ClubMatch - Biljart Competitie Beheer

ClubMatch is een Nederlands biljart competitie beheersysteem voor clubbeheerders. Het systeem maakt het mogelijk om clubleden te beheren, competities te organiseren in meerdere biljartdisciplines, wedstrijden in te plannen met Round Robin algoritmes, scores bij te houden met automatische puntberekening, standen te genereren en live scoreborden weer te geven.

## Technologie Stack

- **Frontend**: Next.js 15.5.9 (React 19, App Router) met TypeScript
- **Styling**: Tailwind CSS met dual thema ondersteuning (licht/donker)
- **Backend**: Next.js API Routes / Server Actions
- **Database**: Google Firestore
- **Authenticatie**: Dual systeem - legacy inlogcode + Firebase Auth (email/wachtwoord)
- **Taal**: Nederlands (UI)

## Vereisten

- Node.js 20+ LTS
- npm of yarn
- Firebase project met Firestore en Authentication ingeschakeld
- Firebase Admin SDK credentials (service account JSON)

## Installatie

1. Clone de repository
2. Kopieer `.env.local.example` naar `.env.local` en vul de Firebase configuratie in
3. Voer het init script uit:

```bash
chmod +x init.sh
./init.sh
```

Of handmatig:

```bash
npm install
npm run dev
```

4. Open http://localhost:3000 in je browser

## Project Structuur

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authenticatie pagina's (inloggen, registreren)
│   ├── (dashboard)/       # Beschermde pagina's
│   │   ├── dashboard/     # Dashboard/overzicht
│   │   ├── competities/   # Competitie beheer
│   │   ├── leden/         # Ledenbeheer
│   │   ├── scoreborden/   # Scoreborden
│   │   ├── instellingen/  # Instellingen
│   │   ├── help/          # Help pagina's
│   │   └── contact/       # Contact formulier
│   └── api/               # API routes
├── components/            # Herbruikbare componenten
│   ├── ui/               # UI basiscomponenten
│   ├── layout/           # Layout componenten
│   ├── forms/            # Formulier componenten
│   └── scoreboard/       # Scorebord componenten
├── context/              # React Context providers
├── hooks/                # Custom React hooks
├── lib/                  # Utility functies en configuratie
│   ├── firebase.ts       # Firebase client SDK
│   ├── firebase-admin.ts # Firebase Admin SDK
│   └── billiards.ts      # Biljart domeinlogica
└── types/                # TypeScript type definities
```

## Disciplines

1. Libre
2. Bandstoten
3. Driebanden klein
4. Driebanden groot
5. Kader

## Puntensystemen

- **WRV 2-1-0**: Winst=2, Gelijk=1, Verlies=0 (met optionele bonuspunten)
- **10-punten**: punten = floor(gemaakte caramboles / te maken caramboles * 10)
- **Belgisch**: zoals 10-punten maar winnaar krijgt 12, gelijk = 11 elk

## Firebase – server app deploy (App Hosting)

De app draait als **serverapplicatie** op **Firebase App Hosting** (Next.js op Cloud Run).

### Configuratie

- **`apphosting.yaml`** – Cloud Run-instellingen (CPU, geheugen, concurrency). Omgevingsvariabelen en secrets stel je in de [Firebase Console](https://console.firebase.google.com) in (App Hosting → backend → Environment) of via `firebase apphosting:secrets:set`.
- **`firebase.json`** – Bevat een `apphosting`-entry met `backendId: "clubmatch"`. Maak eerst een backend in de Console of met de CLI; pas daarna eventueel `backendId` aan.

### Backend aanmaken (eenmalig)

1. Firebase Console → [App Hosting](https://console.firebase.google.com/project/_/apphosting) → **Get started** (Blaze-plan nodig).
2. Kies **Create backend**, koppel je GitHub-repo en zet de app root op de projectmap (waar `package.json` staat). Of via CLI:
   ```bash
   firebase apphosting:backends:create --project JOUW_PROJECT_ID
   ```
3. Noteer de **backend-id** en zet die in `firebase.json` onder `apphosting[0].backendId` (of hernoem de bestaande "clubmatch" naar je backend-id).

### Omgevingsvariabelen en secrets

- In de Console: App Hosting → jouw backend → **Environment**. Vul o.a. `NEXT_PUBLIC_FIREBASE_*` in (zoals in `.env.local`).
- Voor de service account (server):  
  `firebase apphosting:secrets:set FIREBASE_SERVICE_ACCOUNT_KEY`  
  en plak de inhoud van je service account JSON. Voeg in `apphosting.yaml` onder `env:` toe:
  ```yaml
  - variable: FIREBASE_SERVICE_ACCOUNT_KEY
    secret: FIREBASE_SERVICE_ACCOUNT_KEY
  ```

### Deploy

**Via GitHub (aanbevolen):** push naar je live branch (bijv. `main`); App Hosting bouwt en rolt automatisch uit.

**Via CLI (lokaal):**

```bash
firebase login
firebase use JOUW_PROJECT_ID
firebase deploy --only apphosting
# Of alleen deze backend: firebase deploy --only apphosting:clubmatch
```

### Alleen statische Hosting (optioneel)

Voor alleen een statische placeholder op Firebase Hosting (geen API’s):

```bash
npm run build:hosting
firebase deploy --only hosting
```

## Licentie

Alle rechten voorbehouden.

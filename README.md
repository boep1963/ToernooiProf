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

## Firebase Hosting

De app is geconfigureerd voor Firebase Hosting met site **clubmatch**.

- **Config**: `firebase.json` (hosting site: `clubmatch`), `.firebaserc` (Firebase project).
- Pas in `.firebaserc` het project `default` aan naar je eigen Firebase project-id als die afwijkt.

**Deploy (na installatie Firebase CLI: `npm i -g firebase-tools`):**

```bash
firebase login
firebase use clubmatch   # of je project-id
npm run build            # Next.js build
npx next export          # alleen bij static export (zie next.config)
firebase deploy
```

Let op: deze app gebruikt API routes en server-side logica. Voor een volledige deploy met API’s kun je **Firebase App Hosting** (Next.js) of Hosting + **Cloud Functions** gebruiken. Bij een statische export (`next export`) werken de API routes niet; die moeten dan elders (bijv. Cloud Functions) worden gehost.

## Licentie

Alle rechten voorbehouden.

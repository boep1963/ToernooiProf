# Splash-pagina (cold start)

Deze statische HTML wordt direct vanaf de Firebase CDN geserveerd, zodat gebruikers direct iets zien in plaats van een lege pagina tijdens de cold start van App Hosting.

## Werking

- Gebruiker opent de **Hosting-URL** (waar de splash staat).
- De splash toont direct “ClubMatch – De app wordt opgestart…”.
- Na 4 seconden wordt doorgestuurd naar de **App Hosting-URL** (de echte app).

De app-URL staat in `index.html` in de variabele `appUrl`. Pas die aan als je een andere backend-URL gebruikt.

## Deployment

### Optie A: Splash als hoofdpagina van Hosting

1. In `firebase.json`: zet `hosting.public` op `"splash"` in plaats van `"out"` (of gebruik een apart hosting-site).
2. Deploy Hosting: `firebase deploy --only hosting`.
3. Gebruik de Hosting-URL (of je custom domain op Hosting) als **invoer-URL** voor gebruikers.
4. Zorg dat je App Hosting-URL (bijv. `clubmatch--scoreboard-35372.europe-west4.hosted.app`) in `splash/index.html` bij `appUrl` klopt.

Gebruikers gaan dan: **Hosting-URL** → splash (direct) → na 4 s → **App Hosting-URL**.

### Optie B: Aparte Hosting-site voor splash

1. Maak een tweede site aan in de Firebase Console (Hosting → “Add another site”), bijv. `clubmatch-splash`.
2. In `firebase.json`:

```json
"hosting": [
  { "site": "clubmatch", "public": "out" },
  { "site": "clubmatch-splash", "public": "splash" }
]
```

3. Deploy: `firebase deploy --only hosting`.
4. Gebruik de URL van `clubmatch-splash` (bijv. `clubmatch-splash.web.app`) als landingspagina; die toont de splash en stuurt door naar de App Hosting-URL.

## Aanpassen

- **App-URL:** in `splash/index.html` de variabele `appUrl` aanpassen.
- **Wachttijd:** in `splash/index.html` de waarde `delayMs` (nu 4000 = 4 seconden) aanpassen.

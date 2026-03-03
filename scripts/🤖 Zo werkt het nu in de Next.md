🤖 Zo werkt het nu in de Next.js-code met poules, partijen en undo-start:
Data voor poules in ToernooiProf-model
De kern zit in poules (per speler een record met ronde_nr, poule_nr, sp_nummer, sp_moy, sp_car, sp_volgnr).
De API .../competitions/[compNr]/poules/route.ts groepeert die records naar logische poules (ronde + poule), met labels Poule 1, Poule 2, etc.
Start toernooi = partijen per poule genereren (ronde 1)
Endpoint: .../competitions/[compNr]/start/route.ts (POST).
Volgorde:
Toernooi moet nog niet gestart zijn.
Spelers worden geladen.
Ronde-1 poules worden gelezen uit poules; als die ontbreken probeert de code te reconstrueren vanuit spelers.poule_nr.
Er wordt streng gevalideerd: geen gaten in poulenummers, minimaal 2 spelers per poule, elke speler exact 1x gekoppeld.
Per poule wordt round-robin gemaakt en direct in uitslagen geschreven.
Daarna t_gestart=1, t_ronde=1, periode=1.
Nieuwe ronde (na start)
UI: .../toernooien/[id]/ronden/nieuw/page.tsx.
Werkt via server-side concepten (round_drafts) en finalisatie:
GET/PUT .../rounds/draft voor concept-opslag.
POST .../rounds/finalize voor definitieve aanmaak.
Bij finaliseren:
validatie (min 2 per poule, geen gaten, geen dubbele speler),
schrijven van nieuwe ronde in poules,
partijen per poule naar uitslagen,
t_ronde/periode naar de nieuwe ronde.
Undo start (start terugdraaien)
Endpoint: .../competitions/[compNr]/start/route.ts (DELETE).
Mag alleen als je nog op ronde 1 zit.
Doet:
verwijdert alleen ronde-1 uitslagen,
zet t_gestart=0, t_ronde=0, periode=0,
laat ronde-1 poules staan (bewust, voor herstart met dezelfde indeling).
Undo laatste ronde
Endpoint: .../competitions/[compNr]/rounds/undo/route.ts (POST).
Mag alleen voor de laatst bestaande ronde.
Doet:
verwijdert uitslagen + poules van die ronde,
verwijdert bijbehorend round_drafts concept,
zet t_ronde/periode terug (en t_gestart naar 0 als je op 0 uitkomt).
Belangrijk voor jouw scenario (2 poules van 4)
Door het bewaren van ronde-1 poules bij undo-start, gebruikt een herstart dezelfde indeling opnieuw.
Daardoor hoort de generatie weer per poule te gaan (dus 6 per poule, niet alles in één groep).
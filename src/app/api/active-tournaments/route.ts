import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { cachedJsonResponse } from '@/lib/cacheHeaders';
import { DISCIPLINES } from '@/types';

export async function GET() {
  try {
    // Fetch tournaments that have been started (t_gestart = 1)
    const snapshot = await db.collection('toernooien')
      .where('t_gestart', '==', 1)
      .get();

    if (snapshot.empty) {
      return cachedJsonResponse({ tournaments: [] }, 'short');
    }

    // Collect org numbers to fetch org/location names
    const orgNumbers = new Set<number>();
    for (const doc of snapshot.docs) {
      const data = doc.data();
      orgNumbers.add(Number(data.gebruiker_nr));
    }

    // Fetch gebruiker info for location names
    const gebruikerNames = new Map<number, { naam: string; locatie: string }>();
    const gebruikerSnapshot = await db.collection('gebruikers').get();
    for (const doc of gebruikerSnapshot.docs) {
      const data = doc.data();
      gebruikerNames.set(Number(data.gebruiker_nr), {
        naam: String(data.gebruiker_naam ?? ''),
        locatie: String(data.loc_naam ?? ''),
      });
    }

    // Count players per tournament
    const playerCounts = new Map<string, number>();
    const playerSnapshot = await db.collection('spelers').get();
    for (const doc of playerSnapshot.docs) {
      const data = doc.data();
      const key = `${data.gebruiker_nr}_${data.t_nummer}`;
      playerCounts.set(key, (playerCounts.get(key) ?? 0) + 1);
    }

    // Check welke toernooien gespeelde wedstrijden hebben
    const hasResults = new Set<string>();
    const uitslagenSnapshot = await db.collection('uitslagen')
      .where('gespeeld', '==', 1)
      .get();
    for (const doc of uitslagenSnapshot.docs) {
      const data = doc.data();
      hasResults.add(`${data.gebruiker_nr}_${data.t_nummer}`);
    }

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const tournaments = snapshot.docs
      .map(doc => {
        const data = doc.data();
        const gebruikerNr = Number(data.gebruiker_nr);
        const tNummer = Number(data.t_nummer);
        const gebruiker = gebruikerNames.get(gebruikerNr);
        return {
          id: doc.id,
          t_naam: String(data.t_naam ?? ''),
          t_datum: String(data.t_datum ?? ''),
          datum_start: String(data.datum_start ?? ''),
          datum_eind: String(data.datum_eind ?? ''),
          discipline: Number(data.discipline ?? 1),
          discipline_naam: DISCIPLINES[Number(data.discipline)] ?? 'Onbekend',
          t_ronde: Number(data.t_ronde ?? 0),
          openbaar: Number(data.openbaar ?? 0),
          gebruiker_nr: gebruikerNr,
          t_nummer: tNummer,
          organisatie: gebruiker?.naam ?? 'Onbekend',
          locatie: gebruiker?.locatie ?? '',
          aantal_spelers: playerCounts.get(`${gebruikerNr}_${tNummer}`) ?? 0,
          app: 'toernooiprof' as const,
        };
      })
      .filter(t => {
        // Alleen openbare toernooien tonen
        if (t.openbaar === 0) return false;
        // Alleen toernooien die vandaag lopen (datum_start <= vandaag <= datum_eind)
        if (!t.datum_start || !t.datum_eind) return false;
        if (t.datum_start > today || t.datum_eind < today) return false;
        // Alleen toernooien met gespeelde wedstrijden
        return hasResults.has(`${t.gebruiker_nr}_${t.t_nummer}`);
      });

    console.log(`[ACTIVE-TOURNAMENTS] Returning ${tournaments.length} active tournaments (filtered on date: ${today})`);

    return cachedJsonResponse({ tournaments }, 'short');
  } catch (error) {
    console.error('[ACTIVE-TOURNAMENTS] Error:', error);
    return NextResponse.json(
      { error: 'Fout bij ophalen actieve toernooien' },
      { status: 500 }
    );
  }
}

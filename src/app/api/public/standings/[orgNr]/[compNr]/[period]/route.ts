import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { cachedJsonResponse } from '@/lib/cacheHeaders';

interface RouteParams {
  params: Promise<{ orgNr: string; compNr: string; period: string }>;
}

interface StatsEntry {
  sp_nummer: number;
  sp_naam: string;
  matchesPlayed: number;
  carambolesGemaakt: number;
  carambolesTeMaken: number;
  beurten: number;
  hoogsteSerie: number;
  punten: number;
  partijMoyennes: number[];
}

function buildStandings(statsMap: Record<number, StatsEntry>) {
  const standings = Object.values(statsMap)
    .filter(entry => entry.matchesPlayed > 0)
    .map((entry, i) => {
      const percentage = entry.carambolesTeMaken > 0
        ? Math.floor((entry.carambolesGemaakt / entry.carambolesTeMaken) * 100 * 1000) / 1000
        : 0;
      const moyenne = entry.beurten > 0
        ? Math.floor((entry.carambolesGemaakt / entry.beurten) * 1000) / 1000
        : 0;
      const partijMoyenne = entry.partijMoyennes.length > 0
        ? Math.floor(Math.max(...entry.partijMoyennes) * 1000) / 1000
        : 0;

      return {
        rank: i + 1,
        playerName: entry.sp_naam,
        matchesPlayed: entry.matchesPlayed,
        carambolesGemaakt: entry.carambolesGemaakt,
        carambolesTeMaken: entry.carambolesTeMaken,
        percentage,
        beurten: entry.beurten,
        moyenne,
        partijMoyenne,
        hoogsteSerie: entry.hoogsteSerie,
        punten: entry.punten,
      };
    });

  standings.sort((a, b) => {
    if (b.punten !== a.punten) return b.punten - a.punten;
    if (b.percentage !== a.percentage) return b.percentage - a.percentage;
    if (b.moyenne !== a.moyenne) return b.moyenne - a.moyenne;
    return b.hoogsteSerie - a.hoogsteSerie;
  });

  standings.forEach((s, i) => { s.rank = i + 1; });
  return standings;
}

function createEmptyStats(nr: number, naam: string): StatsEntry {
  return {
    sp_nummer: nr,
    sp_naam: naam,
    matchesPlayed: 0,
    carambolesGemaakt: 0,
    carambolesTeMaken: 0,
    beurten: 0,
    hoogsteSerie: 0,
    punten: 0,
    partijMoyennes: [],
  };
}

function aggregateUitslag(statsMap: Record<number, StatsEntry>, u: Record<string, unknown>) {
  const sp1 = Number(u.sp_nummer_1);
  const sp2 = Number(u.sp_nummer_2);
  const brt = Number(u.brt) || 0;
  const sp1gem = Number(u.sp1_car_gem) || 0;
  const sp2gem = Number(u.sp2_car_gem) || 0;
  const sp1tem = Number(u.sp1_car_tem) || 0;
  const sp2tem = Number(u.sp2_car_tem) || 0;
  const sp1hs = Number(u.sp1_hs) || 0;
  const sp2hs = Number(u.sp2_hs) || 0;
  const sp1punt = Number(u.sp1_punt) || 0;
  const sp2punt = Number(u.sp2_punt) || 0;

  if (statsMap[sp1]) {
    statsMap[sp1].matchesPlayed++;
    statsMap[sp1].carambolesGemaakt += sp1gem;
    statsMap[sp1].carambolesTeMaken += sp1tem;
    statsMap[sp1].beurten += brt;
    statsMap[sp1].hoogsteSerie = Math.max(statsMap[sp1].hoogsteSerie, sp1hs);
    statsMap[sp1].punten += sp1punt;
    if (brt > 0 && sp1punt >= sp2punt) {
      statsMap[sp1].partijMoyennes.push(sp1gem / brt);
    }
  }

  if (statsMap[sp2]) {
    statsMap[sp2].matchesPlayed++;
    statsMap[sp2].carambolesGemaakt += sp2gem;
    statsMap[sp2].carambolesTeMaken += sp2tem;
    statsMap[sp2].beurten += brt;
    statsMap[sp2].hoogsteSerie = Math.max(statsMap[sp2].hoogsteSerie, sp2hs);
    statsMap[sp2].punten += sp2punt;
    if (brt > 0 && sp2punt >= sp1punt) {
      statsMap[sp2].partijMoyennes.push(sp2gem / brt);
    }
  }
}

/**
 * GET /api/public/standings/:orgNr/:compNr/:period
 *
 * Publiek endpoint — geen authenticatie vereist.
 * Toont alleen standen van openbare toernooien (openbaar > 0).
 * period = ronde_nr (1..n), of 0 = totaal (alle rondes)
 *
 * Retourneert standen per poule.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr, compNr, period } = await params;

    const orgNummer = parseInt(orgNr, 10);
    const compNumber = parseInt(compNr, 10);
    const rondeNr = parseInt(period, 10);
    if (isNaN(orgNummer) || isNaN(compNumber) || isNaN(rondeNr)) {
      return NextResponse.json({ error: 'Ongeldige parameters' }, { status: 400 });
    }

    // Fetch tournament metadata
    const compSnap = await db.collection('toernooien')
      .where('gebruiker_nr', '==', orgNummer)
      .where('t_nummer', '==', compNumber)
      .limit(1)
      .get();

    if (compSnap.empty) {
      return NextResponse.json({ error: 'Toernooi niet gevonden' }, { status: 404 });
    }

    const compData = compSnap.docs[0].data();

    if (Number(compData?.openbaar ?? 0) === 0) {
      return NextResponse.json({ error: 'Toernooi is niet openbaar' }, { status: 403 });
    }

    if ((Number(compData?.t_gestart) || 0) === 0) {
      return NextResponse.json({ error: 'Toernooi is nog niet gestart' }, { status: 409 });
    }

    const puntenSys = Number(compData?.t_punten_sys ?? compData?.punten_sys) || 1;

    // Fetch spelers
    const spelersSnap = await db.collection('spelers')
      .where('gebruiker_nr', '==', orgNummer)
      .where('t_nummer', '==', compNumber)
      .get();

    const spelerMap: Record<number, string> = {};
    spelersSnap.docs.forEach(d => {
      const data = d.data() ?? {};
      const nr = Number(data.sp_nummer) || 0;
      if (nr > 0) {
        const naam = (data.sp_naam != null && String(data.sp_naam).trim() !== '')
          ? String(data.sp_naam).trim()
          : (data.spa_vnaam != null || data.spa_anaam != null)
            ? [data.spa_vnaam, data.spa_tv, data.spa_anaam].filter(Boolean).map(String).join(' ').trim()
            : '';
        spelerMap[nr] = naam || `Speler ${nr}`;
      }
    });

    // Fetch poule-indeling voor deze ronde
    let pouleQuery = db.collection('poules')
      .where('gebruiker_nr', '==', orgNummer)
      .where('t_nummer', '==', compNumber);
    if (rondeNr !== 0) {
      pouleQuery = pouleQuery.where('ronde_nr', '==', rondeNr);
    }
    const poulesSnap = await pouleQuery.get();

    // Bouw poule → spelers mapping
    const pouleSpelers = new Map<number, Set<number>>();
    poulesSnap.docs.forEach(d => {
      const data = d.data();
      const pouleNr = Number(data.poule_nr) || 0;
      const spNr = Number(data.sp_nummer) || 0;
      if (pouleNr > 0 && spNr > 0) {
        if (!pouleSpelers.has(pouleNr)) pouleSpelers.set(pouleNr, new Set());
        pouleSpelers.get(pouleNr)!.add(spNr);
      }
    });

    // Fetch uitslagen (gespeeld=1)
    let uitslagenQuery = db.collection('uitslagen')
      .where('gebruiker_nr', '==', orgNummer)
      .where('t_nummer', '==', compNumber)
      .where('gespeeld', '==', 1);

    if (rondeNr !== 0) {
      uitslagenQuery = uitslagenQuery.where('t_ronde', '==', rondeNr);
    }

    const uitslagenSnap = await uitslagenQuery.get();

    const hasPoules = pouleSpelers.size > 0;

    if (hasPoules) {
      // Bouw per poule een apart standings overzicht
      const poules: { poule_nr: number; standings: ReturnType<typeof buildStandings> }[] = [];

      const sortedPouleNrs = Array.from(pouleSpelers.keys()).sort((a, b) => a - b);

      for (const pouleNr of sortedPouleNrs) {
        const spelers = pouleSpelers.get(pouleNr)!;
        const statsMap: Record<number, StatsEntry> = {};

        for (const nr of spelers) {
          statsMap[nr] = createEmptyStats(nr, spelerMap[nr] ?? `Speler ${nr}`);
        }

        // Filter uitslagen op spelers in deze poule
        uitslagenSnap.forEach(doc => {
          const u = doc.data() ?? {};
          const poule = Number(u.sp_poule) || 0;
          if (poule === pouleNr) {
            aggregateUitslag(statsMap, u);
          }
        });

        const standings = buildStandings(statsMap);
        if (standings.length > 0) {
          poules.push({ poule_nr: pouleNr, standings });
        }
      }

      return cachedJsonResponse({
        poules,
        competition: {
          comp_naam: compData?.t_naam ?? '',
          discipline: compData?.discipline || 1,
          punten_sys: puntenSys,
          ronde: rondeNr,
        },
      }, 'short');
    } else {
      // Geen poules — alle spelers in één lijst
      const statsMap: Record<number, StatsEntry> = {};
      for (const nr of Object.keys(spelerMap).map(Number)) {
        if (nr <= 0) continue;
        statsMap[nr] = createEmptyStats(nr, spelerMap[nr] ?? `Speler ${nr}`);
      }

      uitslagenSnap.forEach(doc => {
        aggregateUitslag(statsMap, doc.data() ?? {});
      });

      const standings = buildStandings(statsMap);

      return cachedJsonResponse({
        poules: [{ poule_nr: 0, standings }],
        competition: {
          comp_naam: compData?.t_naam ?? '',
          discipline: compData?.discipline || 1,
          punten_sys: puntenSys,
          ronde: rondeNr,
        },
      }, 'short');
    }
  } catch (error) {
    console.error('[PUBLIC-STANDINGS] Error:', error);
    return NextResponse.json(
      { error: 'Fout bij ophalen stand' },
      { status: 500 }
    );
  }
}

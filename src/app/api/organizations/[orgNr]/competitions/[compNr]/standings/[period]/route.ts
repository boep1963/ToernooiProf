import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateOrgAccess } from '@/lib/auth-helper';
import { cachedJsonResponse } from '@/lib/cacheHeaders';

interface RouteParams {
  params: Promise<{ orgNr: string; compNr: string; period: string }>;
}

/**
 * GET /api/organizations/:orgNr/competitions/:compNr/standings/:period
 *
 * Calculate standings from tp_uitslagen (gespeeld=1).
 * period = ronde_nr (1..n), or 0 = totaal (all rounds)
 * Query param: poule_nr (optional, integer)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr, compNr, period } = await params;

    const authResult = validateOrgAccess(request, orgNr);
    if (authResult instanceof NextResponse) return authResult;
    const orgNummer = authResult.orgNummer;

    const compNumber = parseInt(compNr, 10);
    const rondeNr = parseInt(period, 10); // 0 = totaal
    if (isNaN(orgNummer) || isNaN(compNumber) || isNaN(rondeNr)) {
      return NextResponse.json({ error: 'Ongeldige parameters' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    // Accept both poule_nr (integer) and poule_id (for backward compat)
    const pouleNrRaw = searchParams.get('poule_nr') ?? searchParams.get('poule_id');
    const pouleNr = pouleNrRaw ? parseInt(pouleNrRaw, 10) : null;

    console.log(`[STANDINGS] org=${orgNummer} comp=${compNumber} ronde=${rondeNr} poule=${pouleNr ?? 'alle'}`);

    // Fetch tournament for metadata
    const compSnap = await db.collection('toernooien')
      .where('org_nummer', '==', orgNummer)
      .where('t_nummer', '==', compNumber)
      .limit(1)
      .get();

    if (compSnap.empty) {
      return NextResponse.json({ error: 'Toernooi niet gevonden' }, { status: 404 });
    }

    const compData = compSnap.docs[0].data();
    const puntenSys = Number(compData?.t_punten_sys ?? compData?.punten_sys) || 1;

    // Fetch spelers for this tournament
    const spelersSnap = await db.collection('spelers')
      .where('gebruiker_nr', '==', orgNummer)
      .where('t_nummer', '==', compNumber)
      .get();

    const spelerMap: Record<number, string> = {};
    spelersSnap.docs.forEach(d => {
      const data = d.data() ?? {};
      const nr = (data.sp_nummer as number) || 0;
      if (nr) spelerMap[nr] = (data.sp_naam as string) || `Speler ${nr}`;
    });

    // If filtering by poule, get only sp_nummers in that poule
    let pouleSpelers: Set<number> | null = null;
    if (pouleNr !== null && !isNaN(pouleNr)) {
      const poulesSnap = await db.collection('poules')
        .where('gebruiker_nr', '==', orgNummer)
        .where('t_nummer', '==', compNumber)
        .where('poule_nr', '==', pouleNr)
        .get();

      pouleSpelers = new Set<number>();
      poulesSnap.docs.forEach(d => {
        const nr = (d.data()?.sp_nummer as number) || 0;
        if (nr) pouleSpelers!.add(nr);
      });
    }

    // Fetch uitslagen (gespeeld=1)
    let uitslagenQuery = db.collection('uitslagen')
      .where('gebruiker_nr', '==', orgNummer)
      .where('t_nummer', '==', compNumber)
      .where('gespeeld', '==', 1);

    if (rondeNr !== 0) {
      uitslagenQuery = uitslagenQuery.where('t_ronde', '==', rondeNr);
    }

    if (pouleNr !== null && !isNaN(pouleNr)) {
      uitslagenQuery = uitslagenQuery.where('sp_poule', '==', pouleNr);
    }

    const uitslagenSnap = await uitslagenQuery.get();

    // Standings map: sp_nummer → stats
    const statsMap: Record<number, {
      sp_nummer: number;
      sp_naam: string;
      matchesPlayed: number;
      carambolesGemaakt: number;
      carambolesTeMaken: number;
      beurten: number;
      hoogsteSerie: number;
      punten: number;
      partijMoyennes: number[];
    }> = {};

    // Initialize for all relevant spelers
    const relevantSpelers = pouleSpelers
      ? Array.from(pouleSpelers)
      : Object.keys(spelerMap).map(Number);

    for (const nr of relevantSpelers) {
      statsMap[nr] = {
        sp_nummer: nr,
        sp_naam: spelerMap[nr] ?? `Speler ${nr}`,
        matchesPlayed: 0,
        carambolesGemaakt: 0,
        carambolesTeMaken: 0,
        beurten: 0,
        hoogsteSerie: 0,
        punten: 0,
        partijMoyennes: [],
      };
    }

    // Aggregate from uitslagen (tp_uitslagen field names)
    uitslagenSnap.forEach(doc => {
      const u = doc.data() ?? {};
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

      // Player 1
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

      // Player 2
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
    });

    // Calculate derived stats
    const standings = Object.values(statsMap).map((entry, i) => {
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
        playerNr: entry.sp_nummer,
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

    // Sort: punten desc, percentage desc, moyenne desc, hoogste serie desc
    standings.sort((a, b) => {
      if (b.punten !== a.punten) return b.punten - a.punten;
      if (b.percentage !== a.percentage) return b.percentage - a.percentage;
      if (b.moyenne !== a.moyenne) return b.moyenne - a.moyenne;
      return b.hoogsteSerie - a.hoogsteSerie;
    });

    standings.forEach((s, i) => { s.rank = i + 1; });

    const responseData = {
      standings,
      count: standings.length,
      competition: {
        comp_nr: compNumber,
        t_nummer: compNumber,
        comp_naam: compData?.t_naam ?? compData?.comp_naam ?? '',
        discipline: compData?.discipline || 1,
        punten_sys: puntenSys,
        t_punten_sys: puntenSys,
        periode: rondeNr,
      },
    };

    return cachedJsonResponse(responseData, 'default');
  } catch (error) {
    console.error('[STANDINGS] Error:', error);
    return NextResponse.json(
      { error: 'Fout bij berekenen stand', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

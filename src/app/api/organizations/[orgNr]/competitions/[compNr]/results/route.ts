import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { calculateWRVPoints, calculate10PointScore, calculateBelgianScore } from '@/lib/billiards';

interface RouteParams {
  params: Promise<{ orgNr: string; compNr: string }>;
}

/**
 * GET /api/organizations/:orgNr/competitions/:compNr/results
 * List all results in a competition
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr, compNr } = await params;
    const orgNummer = parseInt(orgNr, 10);
    const compNumber = parseInt(compNr, 10);

    if (isNaN(orgNummer) || isNaN(compNumber)) {
      return NextResponse.json(
        { error: 'Ongeldige parameters' },
        { status: 400 }
      );
    }

    console.log('[RESULTS] Querying database for results of competition:', compNumber, 'in org:', orgNummer);
    const snapshot = await db.collection('results')
      .where('org_nummer', '==', orgNummer)
      .where('comp_nr', '==', compNumber)
      .get();

    const results: Record<string, unknown>[] = [];
    snapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });

    // Sort by uitslag_code
    results.sort((a, b) => {
      const codeA = (a.uitslag_code as string) || '';
      const codeB = (b.uitslag_code as string) || '';
      return codeA.localeCompare(codeB);
    });

    console.log(`[RESULTS] Found ${results.length} results for competition ${compNumber}`);
    return NextResponse.json({
      results,
      count: results.length,
    });
  } catch (error) {
    console.error('[RESULTS] Error fetching results:', error);
    return NextResponse.json(
      { error: 'Fout bij ophalen uitslagen', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/organizations/:orgNr/competitions/:compNr/results
 * Submit a match result with auto-calculated points
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr, compNr } = await params;
    const orgNummer = parseInt(orgNr, 10);
    const compNumber = parseInt(compNr, 10);

    if (isNaN(orgNummer) || isNaN(compNumber)) {
      return NextResponse.json(
        { error: 'Ongeldige parameters' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const {
      uitslag_code,
      sp_1_nr,
      sp_1_cartem,
      sp_1_cargem,
      sp_1_hs,
      sp_2_nr,
      sp_2_cartem,
      sp_2_cargem,
      sp_2_hs,
      brt, // beurten (turns)
    } = body;

    if (!uitslag_code || !sp_1_nr || !sp_2_nr) {
      return NextResponse.json(
        { error: 'Verplichte velden ontbreken (uitslag_code, sp_1_nr, sp_2_nr)' },
        { status: 400 }
      );
    }

    if (typeof brt !== 'number' || brt <= 0) {
      return NextResponse.json(
        { error: 'Aantal beurten moet groter zijn dan 0' },
        { status: 400 }
      );
    }

    // Get competition details for point calculation
    console.log('[RESULTS] Fetching competition details...');
    const compSnapshot = await db.collection('competitions')
      .where('org_nummer', '==', orgNummer)
      .where('comp_nr', '==', compNumber)
      .limit(1)
      .get();

    if (compSnapshot.empty) {
      return NextResponse.json(
        { error: 'Competitie niet gevonden' },
        { status: 404 }
      );
    }

    const compData = compSnapshot.docs[0].data();
    const puntenSys = compData?.punten_sys || 1;
    const maxBeurten = compData?.max_beurten || 0;
    const vastBeurten = (compData?.vast_beurten || 0) === 1;
    const periode = compData?.periode || 1;

    // Calculate points based on scoring system
    let sp_1_punt = 0;
    let sp_2_punt = 0;

    const p1Gem = Number(sp_1_cargem) || 0; // caramboles made by player 1
    const p1Tem = Number(sp_1_cartem) || 0;  // target caramboles for player 1
    const p2Gem = Number(sp_2_cargem) || 0;  // caramboles made by player 2
    const p2Tem = Number(sp_2_cartem) || 0;  // target caramboles for player 2
    const turns = Number(brt) || 0;
    const p1Hs = Number(sp_1_hs) || 0;
    const p2Hs = Number(sp_2_hs) || 0;

    // Determine scoring system (first digit)
    const sysType = puntenSys % 10 === 0 ? Math.floor(puntenSys / 10) : puntenSys;

    if (sysType === 1 || puntenSys >= 10) {
      // WRV system
      const wrv = calculateWRVPoints(p1Gem, p1Tem, p2Gem, p2Tem, maxBeurten, turns, vastBeurten, puntenSys);
      sp_1_punt = wrv.points1;
      sp_2_punt = wrv.points2;
      console.log(`[RESULTS] WRV points: P1=${sp_1_punt}, P2=${sp_2_punt}`);
    } else if (sysType === 2) {
      // 10-point system
      sp_1_punt = calculate10PointScore(p1Gem, p1Tem);
      sp_2_punt = calculate10PointScore(p2Gem, p2Tem);
      console.log(`[RESULTS] 10-point: P1=${sp_1_punt}, P2=${sp_2_punt}`);
    } else if (sysType === 3) {
      // Belgian system
      const belgian = calculateBelgianScore(p1Gem, p1Tem, p2Gem, p2Tem);
      sp_1_punt = belgian.points1;
      sp_2_punt = belgian.points2;
      console.log(`[RESULTS] Belgian: P1=${sp_1_punt}, P2=${sp_2_punt}`);
    }

    // Check if result already exists for this match
    const existingResult = await db.collection('results')
      .where('org_nummer', '==', orgNummer)
      .where('comp_nr', '==', compNumber)
      .where('uitslag_code', '==', uitslag_code)
      .limit(1)
      .get();

    const resultData = {
      org_nummer: orgNummer,
      comp_nr: compNumber,
      uitslag_code: String(uitslag_code),
      periode: periode,
      speeldatum: new Date().toISOString(),
      sp_1_nr: Number(sp_1_nr),
      sp_1_cartem: p1Tem,
      sp_1_cargem: p1Gem,
      sp_1_hs: p1Hs,
      sp_1_punt: sp_1_punt,
      brt: turns,
      sp_2_nr: Number(sp_2_nr),
      sp_2_cartem: p2Tem,
      sp_2_cargem: p2Gem,
      sp_2_hs: p2Hs,
      sp_2_punt: sp_2_punt,
      gespeeld: 1,
    };

    let resultId: string;

    if (!existingResult.empty) {
      // Update existing result
      const docRef = existingResult.docs[0].ref;
      await docRef.update(resultData);
      resultId = existingResult.docs[0].id;
      console.log(`[RESULTS] Updated existing result: ${resultId}`);
    } else {
      // Create new result
      const docRef = await db.collection('results').add(resultData);
      resultId = docRef.id;
      console.log(`[RESULTS] Created new result: ${resultId}`);
    }

    // Mark the match as played (gespeeld=1)
    console.log('[RESULTS] Marking match as played...');
    const matchSnapshot = await db.collection('matches')
      .where('org_nummer', '==', orgNummer)
      .where('comp_nr', '==', compNumber)
      .where('uitslag_code', '==', uitslag_code)
      .limit(1)
      .get();

    if (!matchSnapshot.empty) {
      await matchSnapshot.docs[0].ref.update({ gespeeld: 1 });
      console.log('[RESULTS] Match marked as played');
    }

    return NextResponse.json({
      id: resultId,
      ...resultData,
      message: 'Uitslag succesvol opgeslagen',
    }, { status: 201 });
  } catch (error) {
    console.error('[RESULTS] Error saving result:', error);
    return NextResponse.json(
      { error: 'Fout bij opslaan uitslag', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

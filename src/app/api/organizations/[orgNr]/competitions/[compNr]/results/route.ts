import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateOrgAccess } from '@/lib/auth-helper';
import { calculateWRVPoints, calculate10PointScore, calculateBelgianScore } from '@/lib/billiards';
import { parseDutchDate } from '@/lib/dateUtils';
import { queryWithOrgComp } from '@/lib/firestoreUtils';

interface RouteParams {
  params: Promise<{ orgNr: string; compNr: string }>;
}

/**
 * GET /api/organizations/:orgNr/competitions/:compNr/results
 * List all results in a competition
 *
 * Query params:
 * - startDate (optional): ISO date string for filtering results from this date onwards
 * - endDate (optional): ISO date string for filtering results up to this date
 * - gespeeld (optional): filter by gespeeld status (1 = played, 0 = not played)
 * - periode (optional): filter by periode number (1, 2, 3, etc.)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr, compNr } = await params;

    // Validate session and org access
    const authResult = validateOrgAccess(request, orgNr);
    if (authResult instanceof NextResponse) return authResult;
    const orgNummer = authResult.orgNummer;

    const compNumber = parseInt(compNr, 10);
    if (isNaN(compNumber)) {
      return NextResponse.json(
        { error: 'Ongeldige parameters' },
        { status: 400 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const gespeeldParam = searchParams.get('gespeeld');
    const periodeParam = searchParams.get('periode');

    console.log('[RESULTS] Querying database for results of competition:', compNumber, 'in org:', orgNummer);
    console.log('[RESULTS] Filters - startDate:', startDate, 'endDate:', endDate, 'gespeeld:', gespeeldParam, 'periode:', periodeParam);

    // Build additional filters (gespeeld, periode)
    const additionalFilters: Array<{ field: string; op: FirebaseFirestore.WhereFilterOp; value: any }> = [];

    if (gespeeldParam !== null) {
      const gespeeld = parseInt(gespeeldParam, 10);
      if (!isNaN(gespeeld)) {
        additionalFilters.push({ field: 'gespeeld', op: '==', value: gespeeld });
      }
    }

    if (periodeParam !== null) {
      const periode = parseInt(periodeParam, 10);
      if (!isNaN(periode)) {
        additionalFilters.push({ field: 'periode', op: '==', value: periode });
        console.log('[RESULTS] Filtering by periode:', periode);
      }
    }

    // Use dual-type query to handle both string and number variants
    const snapshot = await queryWithOrgComp(
      db.collection('results'),
      orgNummer,
      compNumber,
      additionalFilters
    );

    const results: Record<string, unknown>[] = [];
    snapshot.docs.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });

    // Filter by date range if provided (client-side filtering since Firestore date comparison is complex)
    let filteredResults = results;
    if (startDate || endDate) {
      filteredResults = results.filter((result) => {
        const speeldatum = result.speeldatum as string;
        if (!speeldatum) return false;

        // Use parseDutchDate to handle DD-MM-YYYY format from Firestore
        const resultDate = parseDutchDate(speeldatum);
        if (!resultDate) return false;

        if (startDate) {
          // parseDutchDate also handles YYYY-MM-DD from HTML date inputs
          const start = parseDutchDate(startDate);
          if (!start) return false;
          start.setHours(0, 0, 0, 0);
          if (resultDate < start) return false;
        }

        if (endDate) {
          const end = parseDutchDate(endDate);
          if (!end) return false;
          end.setHours(23, 59, 59, 999);
          if (resultDate > end) return false;
        }

        return true;
      });
    }

    // Sort by uitslag_code
    filteredResults.sort((a, b) => {
      const codeA = (a.uitslag_code as string) || '';
      const codeB = (b.uitslag_code as string) || '';
      return codeA.localeCompare(codeB);
    });

    console.log(`[RESULTS] Found ${filteredResults.length} results for competition ${compNumber} (after filters)`);
    return NextResponse.json({
      results: filteredResults,
      count: filteredResults.length,
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

    // Validate session and org access
    const authResult = validateOrgAccess(request, orgNr);
    if (authResult instanceof NextResponse) return authResult;
    const orgNummer = authResult.orgNummer;

    const compNumber = parseInt(compNr, 10);
    if (isNaN(compNumber)) {
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
    const compSnapshot = await queryWithOrgComp(
      db.collection('competitions'),
      orgNummer,
      compNumber
    );

    if (compSnapshot.empty) {
      return NextResponse.json(
        { error: 'Competitie niet gevonden' },
        { status: 404 }
      );
    }

    const compData = compSnapshot.docs[0].data();
    const puntenSys = (compData?.punten_sys as number) || 1;
    const maxBeurten = (compData?.max_beurten as number) || 0;
    const vastBeurten = ((compData?.vast_beurten as number) || 0) === 1;
    const periode = (compData?.periode as number) || 1;
    const discipline = (compData?.discipline as number) || 1;

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
      // WRV system - need player moyennes for bonus calculation
      let p1Moyenne: number | undefined;
      let p2Moyenne: number | undefined;

      // Fetch player moyennes from competition_players
      const player1Snapshot = await queryWithOrgComp(
        db.collection('competition_players'),
        orgNummer,
        compNumber,
        [{ field: 'spc_nummer', op: '==', value: Number(sp_1_nr) }],
        'spc_org',
        'spc_competitie'
      );

      const player2Snapshot = await queryWithOrgComp(
        db.collection('competition_players'),
        orgNummer,
        compNumber,
        [{ field: 'spc_nummer', op: '==', value: Number(sp_2_nr) }],
        'spc_org',
        'spc_competitie'
      );

      if (!player1Snapshot.empty) {
        const p1Data = player1Snapshot.docs[0].data();
        // Get moyenne for the current discipline
        const moyenneField = `spc_moyenne_${discipline}`;
        p1Moyenne = Number(p1Data?.[moyenneField] as number) || 0;
      }

      if (!player2Snapshot.empty) {
        const p2Data = player2Snapshot.docs[0].data();
        const moyenneField = `spc_moyenne_${discipline}`;
        p2Moyenne = Number(p2Data?.[moyenneField] as number) || 0;
      }

      const wrv = calculateWRVPoints(p1Gem, p1Tem, p2Gem, p2Tem, maxBeurten, turns, vastBeurten, puntenSys, p1Moyenne, p2Moyenne);
      sp_1_punt = wrv.points1;
      sp_2_punt = wrv.points2;
      console.log(`[RESULTS] WRV points: P1=${sp_1_punt}, P2=${sp_2_punt} (P1 moyenne: ${p1Moyenne}, P2 moyenne: ${p2Moyenne})`);
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

    // Prepare result data outside transaction
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

    // Use Firestore transaction to prevent race conditions from concurrent submissions
    // This ensures atomicity: only one result per uitslag_code will be created
    const resultId = await db.runTransaction(async (transaction) => {
      // Check if result already exists within transaction
      const existingResult = await transaction.get(
        db.collection('results')
          .where('org_nummer', '==', orgNummer)
          .where('comp_nr', '==', compNumber)
          .where('uitslag_code', '==', uitslag_code)
          .limit(1)
      );

      if (!existingResult.empty) {
        // Update existing result
        const docRef = existingResult.docs[0].ref;
        transaction.update(docRef, resultData);
        console.log(`[RESULTS] Updating existing result in transaction: ${docRef.id}`);
        return docRef.id;
      } else {
        // Create new result
        const newDocRef = db.collection('results').doc();
        transaction.set(newDocRef, resultData);
        console.log(`[RESULTS] Creating new result in transaction: ${newDocRef.id}`);
        return newDocRef.id;
      }
    });

    // Mark the match as played (gespeeld=1)
    console.log('[RESULTS] Marking match as played...');
    const matchSnapshot = await queryWithOrgComp(
      db.collection('matches'),
      orgNummer,
      compNumber,
      [{ field: 'uitslag_code', op: '==', value: uitslag_code }]
    );

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

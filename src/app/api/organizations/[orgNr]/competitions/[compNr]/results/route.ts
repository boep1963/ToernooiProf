import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateOrgAccess } from '@/lib/auth-helper';
import { calculateWRVPoints, calculate10PointScore, calculateBelgianScore, formatPlayerName } from '@/lib/billiards';
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

    // Lazy denormalization: enrich results missing player names
    const resultsToEnrich = filteredResults.filter(r => !r.sp_1_naam || !r.sp_2_naam);

    if (resultsToEnrich.length > 0) {
      console.log(`[RESULTS] Lazy denormalization: ${resultsToEnrich.length} results missing player names`);

      // Get competition settings for name formatting
      const compSnapshot = await queryWithOrgComp(
        db.collection('competitions'),
        orgNummer,
        compNumber
      );
      const sorteren = compSnapshot.empty ? 1 : ((compSnapshot.docs[0].data()?.sorteren as number) || 1);

      // Collect unique player numbers that need names
      const playerNrsNeeded = new Set<number>();
      for (const result of resultsToEnrich) {
        if (!result.sp_1_naam) playerNrsNeeded.add(Number(result.sp_1_nr)); // FIX #190: Convert to number
        if (!result.sp_2_naam) playerNrsNeeded.add(Number(result.sp_2_nr)); // FIX #190: Convert to number
      }

      // Batch fetch player data from competition_players
      const playerMap = new Map<number, string>();
      const playerNrsArray = Array.from(playerNrsNeeded);

      // First pass: get data from competition_players and identify players needing member lookup
      const playersNeedingMemberLookup = new Set<number>();
      const compPlayerData = new Map<number, { vnaam: string; tv: string; anaam: string }>();

      for (let i = 0; i < playerNrsArray.length; i += 30) {
        const batch = playerNrsArray.slice(i, i + 30);
        const playersSnapshot = await queryWithOrgComp(
          db.collection('competition_players'),
          orgNummer,
          compNumber,
          [{ field: 'spc_nummer', op: 'in', value: batch }],
          'spc_org',
          'spc_competitie'
        );

        for (const doc of playersSnapshot.docs) {
          const data = doc.data();
          const nummer = Number(data.spc_nummer);
          const vnaam = data.spa_vnaam;
          const tv = data.spa_tv;
          const anaam = data.spa_anaam;
          const hasEmptyName = !vnaam && !tv && !anaam;

          if (hasEmptyName) {
            playersNeedingMemberLookup.add(nummer);
          } else {
            compPlayerData.set(nummer, { vnaam, tv, anaam });
          }
        }
      }

      // Second pass: batch fetch members for players with empty names (OPTIMIZATION: single batch query instead of N sequential queries)
      const memberDataMap = new Map<number, { vnaam: string; tv: string; anaam: string }>();
      if (playersNeedingMemberLookup.size > 0) {
        const membersArray = Array.from(playersNeedingMemberLookup);
        console.log(`[RESULTS] Batch fetching ${membersArray.length} members for name lookup`);

        for (let i = 0; i < membersArray.length; i += 30) {
          const batch = membersArray.slice(i, i + 30);
          const membersSnapshot = await queryWithOrgComp(
            db.collection('members'),
            orgNummer,
            null,
            [{ field: 'spa_nummer', op: 'in', value: batch }],
            'spa_org'
          );

          for (const doc of membersSnapshot.docs) {
            const memberData = doc.data();
            const nummer = Number(memberData.spa_nummer);
            memberDataMap.set(nummer, {
              vnaam: memberData.spa_vnaam,
              tv: memberData.spa_tv,
              anaam: memberData.spa_anaam
            });
          }
        }
      }

      // Third pass: build playerMap with formatted names
      for (const nummer of playerNrsArray) {
        let vnaam: string | undefined;
        let tv: string | undefined;
        let anaam: string | undefined;

        // Use competition_players data if available, otherwise use member data
        const compData = compPlayerData.get(nummer);
        const memberData = memberDataMap.get(nummer);

        if (compData) {
          vnaam = compData.vnaam;
          tv = compData.tv;
          anaam = compData.anaam;
        } else if (memberData) {
          vnaam = memberData.vnaam;
          tv = memberData.tv;
          anaam = memberData.anaam;
        }

        const naam = formatPlayerName(vnaam, tv, anaam, sorteren);
        if (naam) {
          playerMap.set(nummer, naam);
        } else {
          console.log(`[RESULTS] No name found for player ${nummer} (compData: ${!!compData}, memberData: ${!!memberData})`);
        }
      }

      // Update results in Firestore and in-memory
      // For players without names in any lookup table, use a fallback name
      // to prevent repeated lookups on every request
      let batch = db.batch(); // FIX #189: Changed const to let for batch recreation
      let batchCount = 0;

      for (const result of resultsToEnrich) {
        const updateData: Record<string, unknown> = {};
        // FIX #190: Cast to Number for Map lookup (Map uses strict equality)
        const sp1Nr = Number(result.sp_1_nr);
        const sp2Nr = Number(result.sp_2_nr);
        const sp1Name = playerMap.get(sp1Nr);
        const sp2Name = playerMap.get(sp2Nr);

        if (!result.sp_1_naam) {
          // Use found name or fallback to "Speler N" to prevent repeated lookups
          const name = sp1Name || `Speler ${sp1Nr}`;
          updateData.sp_1_naam = name;
          result.sp_1_naam = name;
        }
        if (!result.sp_2_naam) {
          const name = sp2Name || `Speler ${sp2Nr}`;
          updateData.sp_2_naam = name;
          result.sp_2_naam = name;
        }

        if (Object.keys(updateData).length > 0) {
          const docRef = db.collection('results').doc(result.id as string);
          batch.update(docRef, updateData);
          batchCount++;

          // Firestore has a 500 operation limit per batch
          if (batchCount >= 450) {
            await batch.commit();
            batch = db.batch(); // FIX #189: Create new batch after commit
            batchCount = 0;
          }
        }
      }

      if (batchCount > 0) {
        await batch.commit();
        console.log(`[RESULTS] Batch committed ${batchCount} name updates to Firestore`);
      } else {
        console.log(`[RESULTS] No names to persist (all players missing name data)`);
      }

      console.log(`[RESULTS] Denormalized ${resultsToEnrich.length} results with player names`);
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

    if (typeof brt !== 'number' || brt < 1) {
      return NextResponse.json(
        { error: 'Aantal beurten moet minimaal 1 zijn' },
        { status: 400 }
      );
    }

    // Validate caramboles and highest series (cannot be negative)
    const p1Cargem = Number(sp_1_cargem) || 0;
    const p1Hs = Number(sp_1_hs) || 0;
    const p2Cargem = Number(sp_2_cargem) || 0;
    const p2Hs = Number(sp_2_hs) || 0;

    if (p1Cargem < 0) {
      return NextResponse.json(
        { error: 'Caramboles gemaakt voor speler 1 kunnen niet negatief zijn' },
        { status: 400 }
      );
    }
    if (p2Cargem < 0) {
      return NextResponse.json(
        { error: 'Caramboles gemaakt voor speler 2 kunnen niet negatief zijn' },
        { status: 400 }
      );
    }
    if (p1Hs < 0) {
      return NextResponse.json(
        { error: 'Hoogste serie voor speler 1 kan niet negatief zijn' },
        { status: 400 }
      );
    }
    if (p2Hs < 0) {
      return NextResponse.json(
        { error: 'Hoogste serie voor speler 2 kan niet negatief zijn' },
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

    // Additional validation after fetching competition data
    // Validate caramboles gemaakt <= te maken caramboles (unless vast_beurten)
    // For fixed-turns competitions, players can make unlimited caramboles
    const p1Cartem = Number(sp_1_cartem) || 0;
    const p2Cartem = Number(sp_2_cartem) || 0;

    if (!vastBeurten) {
      if (p1Cargem > p1Cartem) {
        return NextResponse.json(
          { error: `Speler 1: caramboles gemaakt (${p1Cargem}) kan niet meer zijn dan te maken caramboles (${p1Cartem})` },
          { status: 400 }
        );
      }
      if (p2Cargem > p2Cartem) {
        return NextResponse.json(
          { error: `Speler 2: caramboles gemaakt (${p2Cargem}) kan niet meer zijn dan te maken caramboles (${p2Cartem})` },
          { status: 400 }
        );
      }
    }

    // Validate logical consistency: hoogste serie × beurten >= caramboles gemaakt
    // This ensures the highest series is physically possible given the number of turns
    if (p1Hs * brt < p1Cargem) {
      return NextResponse.json(
        { error: `Speler 1: hoogste serie (${p1Hs}) × beurten (${brt}) = ${p1Hs * brt} is minder dan caramboles gemaakt (${p1Cargem}). Dit is niet mogelijk.` },
        { status: 400 }
      );
    }
    if (p2Hs * brt < p2Cargem) {
      return NextResponse.json(
        { error: `Speler 2: hoogste serie (${p2Hs}) × beurten (${brt}) = ${p2Hs * brt} is minder dan caramboles gemaakt (${p2Cargem}). Dit is niet mogelijk.` },
        { status: 400 }
      );
    }

    // Calculate points based on scoring system
    let sp_1_punt = 0;
    let sp_2_punt = 0;

    // Use variables already defined above for validation
    const p1Gem = p1Cargem; // caramboles made by player 1
    const p1Tem = p1Cartem; // target caramboles for player 1
    const p2Gem = p2Cargem; // caramboles made by player 2
    const p2Tem = p2Cartem; // target caramboles for player 2
    const turns = brt;

    // Determine scoring system (first digit)
    const sysType = puntenSys % 10 === 0 ? Math.floor(puntenSys / 10) : puntenSys;

    // Fetch player data from competition_players (for moyennes) and members (for names)
    let p1Moyenne: number | undefined;
    let p2Moyenne: number | undefined;
    let sp_1_naam: string | undefined;
    let sp_2_naam: string | undefined;

    const sorteren = (compData?.sorteren as number) || 1;

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
      const moyenneField = `spc_moyenne_${discipline}`;
      p1Moyenne = Number(p1Data?.[moyenneField] as number) || 0;
    }

    if (!player2Snapshot.empty) {
      const p2Data = player2Snapshot.docs[0].data();
      const moyenneField = `spc_moyenne_${discipline}`;
      p2Moyenne = Number(p2Data?.[moyenneField] as number) || 0;
    }

    // Fetch player names from members collection
    const member1Snapshot = await queryWithOrgComp(
      db.collection('members'),
      orgNummer,
      null,
      [{ field: 'spa_nummer', op: '==', value: Number(sp_1_nr) }],
      'spa_org'
    );
    if (!member1Snapshot.empty) {
      const m1Data = member1Snapshot.docs[0].data();
      sp_1_naam = formatPlayerName(m1Data.spa_vnaam, m1Data.spa_tv, m1Data.spa_anaam, sorteren);
    }

    const member2Snapshot = await queryWithOrgComp(
      db.collection('members'),
      orgNummer,
      null,
      [{ field: 'spa_nummer', op: '==', value: Number(sp_2_nr) }],
      'spa_org'
    );
    if (!member2Snapshot.empty) {
      const m2Data = member2Snapshot.docs[0].data();
      sp_2_naam = formatPlayerName(m2Data.spa_vnaam, m2Data.spa_tv, m2Data.spa_anaam, sorteren);
    }

    if (sysType === 1 || puntenSys >= 10) {
      // WRV system - use player moyennes for bonus calculation
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
    const resultData: Record<string, unknown> = {
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

    // Add denormalized player names if available (for performance)
    if (sp_1_naam) resultData.sp_1_naam = sp_1_naam;
    if (sp_2_naam) resultData.sp_2_naam = sp_2_naam;

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

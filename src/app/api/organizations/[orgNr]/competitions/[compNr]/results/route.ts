import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateOrgAccess } from '@/lib/auth-helper';
import { calculateWRVPoints, calculate10PointScore, calculateBelgianScore, formatPlayerName } from '@/lib/billiards';
import { parseDutchDate } from '@/lib/dateUtils';
import { queryWithOrgComp } from '@/lib/firestoreUtils';
import standingsCache from '@/lib/standingsCache';
import { cachedJsonResponse } from '@/lib/cacheHeaders';

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

    const tournamentSnap = await db.collection('toernooien')
      .where('org_nummer', '==', orgNummer)
      .where('t_nummer', '==', compNumber)
      .limit(1)
      .get();
    if (tournamentSnap.empty) {
      return NextResponse.json({ error: 'Toernooi niet gevonden' }, { status: 404 });
    }
    const tournamentData = tournamentSnap.docs[0].data() ?? {};
    if ((Number(tournamentData.t_gestart) || 0) === 0) {
      return NextResponse.json(
        { error: 'Uitslagen per speler zijn pas beschikbaar nadat het toernooi is gestart.' },
        { status: 409 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const gespeeldParam = searchParams.get('gespeeld');
    const periodeParam = searchParams.get('periode');
    const pouleIdParam = searchParams.get('poule_id');

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

    if (pouleIdParam !== null) {
      additionalFilters.push({ field: 'poule_id', op: '==', value: pouleIdParam });
      console.log('[RESULTS] Filtering by poule_id:', pouleIdParam);
    }

    // Use dual-type query to handle both string and number variants
    const snapshot = await queryWithOrgComp(
      db.collection('results') as any,
      orgNummer,
      compNumber,
      additionalFilters
    );

    let results: Record<string, unknown>[] = [];
    snapshot.docs.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });

    // Fallback: ToernooiProf gebruikt uitslagen-collectie (tp_uitslagen), niet results (ClubMatch)
    if (results.length === 0) {
      let uitslagenQuery = db.collection('uitslagen')
        .where('gebruiker_nr', '==', orgNummer)
        .where('t_nummer', '==', compNumber)
        .where('gespeeld', '==', gespeeldParam ? parseInt(gespeeldParam, 10) : 1);

      if (periodeParam) {
        const periode = parseInt(periodeParam, 10);
        if (!isNaN(periode)) uitslagenQuery = uitslagenQuery.where('t_ronde', '==', periode);
      }

      const uitslagenSnap = await uitslagenQuery.get();

      // Haal spelers op voor namen
      const spelersSnap = await db.collection('spelers')
        .where('gebruiker_nr', '==', orgNummer)
        .where('t_nummer', '==', compNumber)
        .get();
      const spelerMap = new Map<number, string>();
      spelersSnap.docs.forEach(d => {
        const d_ = d.data();
        const nr = Number(d_.sp_nummer);
        const naam = d_.sp_naam;
        if (nr && naam) spelerMap.set(nr, naam);
      });

      const compSnap = await db.collection('toernooien')
        .where('gebruiker_nr', '==', orgNummer)
        .where('t_nummer', '==', compNumber)
        .limit(1)
        .get();
      let speeldatumBase = '2000-01-01';
      if (!compSnap.empty) {
        const ds = compSnap.docs[0].data()?.datum_start as string;
        if (ds && /^\d{4}-\d{2}-\d{2}/.test(ds)) speeldatumBase = ds.slice(0, 10);
      }

      results = uitslagenSnap.docs.map((doc) => {
        const u = doc.data();
        const tRonde = Number(u.t_ronde) || 1;
        const pRonde = Number(u.p_ronde) || 1;
        const koppel = Number(u.koppel) || 1;
        const d = new Date(speeldatumBase);
        d.setDate(d.getDate() + (tRonde - 1));
        const speeldatum = d.toISOString().slice(0, 10);
        const sp1Nr = Number(u.sp_nummer_1);
        const sp2Nr = Number(u.sp_nummer_2);
        return {
          id: doc.id,
          uitslag_code: u.sp_partcode || `${tRonde}_${pRonde}_${koppel}`,
          speeldatum,
          periode: tRonde,
          sp_1_nr: sp1Nr,
          sp_1_naam: spelerMap.get(sp1Nr) || `Speler ${sp1Nr}`,
          sp_1_cargem: Number(u.sp1_car_gem) || 0,
          sp_1_hs: Number(u.sp1_hs) || 0,
          sp_1_punt: Number(u.sp1_punt) || 0,
          sp_2_nr: sp2Nr,
          sp_2_naam: spelerMap.get(sp2Nr) || `Speler ${sp2Nr}`,
          sp_2_cargem: Number(u.sp2_car_gem) || 0,
          sp_2_hs: Number(u.sp2_hs) || 0,
          sp_2_punt: Number(u.sp2_punt) || 0,
          brt: Number(u.brt) || 0,
          gespeeld: Number(u.gespeeld) || 0,
        };
      });
      console.log(`[RESULTS] Fallback uitslagen: ${results.length} records voor ToernooiProf-model`);
    }

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
        db.collection('competitions') as any,
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
          db.collection('competition_players') as any,
          orgNummer,
          compNumber,
          [{ field: 'spc_nummer', op: 'in', value: batch }],
          'spc_org',
          'spc_competitie'
        );

        for (const doc of playersSnapshot.docs) {
          const data = doc.data();
          if (!data) continue;
          const nummer = Number(data.spc_nummer);
          const vnaam = data.spa_vnaam;
          const tv = data.spa_tv;
          const anaam = data.spa_anaam;
          const hasEmptyName = !vnaam && !tv && !anaam;

          if (hasEmptyName) {
            playersNeedingMemberLookup.add(nummer);
          } else if (vnaam !== undefined && anaam !== undefined) {
            compPlayerData.set(nummer, { vnaam, tv: tv || '', anaam });
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
            db.collection('members') as any,
            orgNummer,
            null,
            [{ field: 'spa_nummer', op: 'in', value: batch }],
            'spa_org'
          );

          for (const doc of membersSnapshot.docs) {
            const memberData = doc.data();
            if (!memberData) continue;
            const nummer = Number(memberData.spa_nummer);
            memberDataMap.set(nummer, {
              vnaam: memberData.spa_vnaam || '',
              tv: memberData.spa_tv || '',
              anaam: memberData.spa_anaam || ''
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
    return cachedJsonResponse({
      results: filteredResults,
      count: filteredResults.length,
    }, 'default');
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
      poule_id,
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
      db.collection('competitions') as any,
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

    // Validate logical consistency: hoogste serie moet minimaal ceil(cargem/beurten) zijn
    // Bij 25 caramboles in 2 beurten moet HS minimaal 13 zijn; HS=3 of 0 is ongeldig.
    const minP1Hs = brt > 0 && p1Cargem > 0 ? Math.ceil(p1Cargem / brt) : 0;
    const minP2Hs = brt > 0 && p2Cargem > 0 ? Math.ceil(p2Cargem / brt) : 0;
    if (p1Hs < minP1Hs) {
      return NextResponse.json(
        { error: `Speler 1: hoogste serie moet minimaal ${minP1Hs} zijn (bij ${p1Cargem} caramboles in ${brt} beurt${brt === 1 ? '' : 'en'}).` },
        { status: 400 }
      );
    }
    if (p2Hs < minP2Hs) {
      return NextResponse.json(
        { error: `Speler 2: hoogste serie moet minimaal ${minP2Hs} zijn (bij ${p2Cargem} caramboles in ${brt} beurt${brt === 1 ? '' : 'en'}).` },
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

    // Determine base scoring system: 30000 -> 3 (Belgisch), 20000 -> 2 (10-punten), 10000/11100 -> 1 (WRV)
    const baseSys = puntenSys >= 10000 ? Math.floor(puntenSys / 10000) : (puntenSys % 10 === 0 ? Math.floor(puntenSys / 10) : puntenSys);

    // 10-punten systeem is niet toegestaan bij vast aantal beurten (spec)
    if (baseSys === 2 && vastBeurten) {
      return NextResponse.json(
        { error: '10-punten systeem is niet toegestaan bij een competitie met vast aantal beurten.' },
        { status: 400 }
      );
    }

    // Fetch player data from competition_players (for moyennes) and members (for names)
    let p1Moyenne: number | undefined;
    let p2Moyenne: number | undefined;
    let sp_1_naam: string | undefined;
    let sp_2_naam: string | undefined;

    const sorteren = (compData?.sorteren as number) || 1;

    // Batch fetch both players from competition_players (1 query instead of 2)
    const playerNrs = [Number(sp_1_nr), Number(sp_2_nr)];
    const playersSnapshot = await queryWithOrgComp(
      db.collection('competition_players') as any,
      orgNummer,
      compNumber,
      [{ field: 'spc_nummer', op: 'in', value: playerNrs }],
      'spc_org',
      'spc_competitie'
    );

    // Split results by player number
    const playerDataMap = new Map<number, FirebaseFirestore.DocumentData>();
    playersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data) {
        playerDataMap.set(Number(data.spc_nummer), data);
      }
    });

    const p1Data = playerDataMap.get(Number(sp_1_nr));
    const p2Data = playerDataMap.get(Number(sp_2_nr));

    // Extract moyennes (period moyenne for WRV bonus: spc_moyenne_1..5 = periods)
    if (p1Data) {
      const moyenneField = `spc_moyenne_${periode}`;
      p1Moyenne = Number(p1Data[moyenneField]) || 0;
    }

    if (p2Data) {
      const moyenneField = `spc_moyenne_${periode}`;
      p2Moyenne = Number(p2Data[moyenneField]) || 0;
    }

    // Batch fetch both players from members collection (1 query instead of 2)
    const membersSnapshot = await queryWithOrgComp(
      db.collection('members') as any,
      orgNummer,
      null,
      [{ field: 'spa_nummer', op: 'in', value: playerNrs }],
      'spa_org'
    );

    // Split results by player number
    const memberDataMap = new Map<number, FirebaseFirestore.DocumentData>();
    membersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      memberDataMap.set(Number(data.spa_nummer), data);
    });

    const m1Data = memberDataMap.get(Number(sp_1_nr));
    const m2Data = memberDataMap.get(Number(sp_2_nr));

    // Format player names
    if (m1Data) {
      sp_1_naam = formatPlayerName(m1Data.spa_vnaam || '', m1Data.spa_tv || '', m1Data.spa_anaam || '', sorteren);
    }
 
    if (m2Data) {
      sp_2_naam = formatPlayerName(m2Data.spa_vnaam || '', m2Data.spa_tv || '', m2Data.spa_anaam || '', sorteren);
    }

    if (baseSys === 1) {
      // WRV system - use player moyennes for bonus calculation
      const wrv = calculateWRVPoints(p1Gem, p1Tem, p2Gem, p2Tem, maxBeurten, turns, vastBeurten, puntenSys, p1Moyenne, p2Moyenne);
      sp_1_punt = wrv.points1;
      sp_2_punt = wrv.points2;
      console.log(`[RESULTS] WRV points: P1=${sp_1_punt}, P2=${sp_2_punt} (P1 moyenne: ${p1Moyenne}, P2 moyenne: ${p2Moyenne})`);
    } else if (baseSys === 2) {
      // 10-point system
      sp_1_punt = calculate10PointScore(p1Gem, p1Tem);
      sp_2_punt = calculate10PointScore(p2Gem, p2Tem);
      console.log(`[RESULTS] 10-point: P1=${sp_1_punt}, P2=${sp_2_punt}`);
    } else if (baseSys === 3) {
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
      poule_id: poule_id || null,
    };

    // Add denormalized player names if available (for performance)
    if (sp_1_naam) resultData.sp_1_naam = sp_1_naam;
    if (sp_2_naam) resultData.sp_2_naam = sp_2_naam;

    // Check if result already exists
    console.log('[RESULTS] Checking if result already exists...');
    const existingResult = await queryWithOrgComp(
      db.collection('results') as any,
      orgNummer,
      compNumber,
      [{ field: 'uitslag_code', op: '==', value: uitslag_code }]
    );

    let resultId: string;
    if (!existingResult.empty) {
      // Update existing result
      const docRef = existingResult.docs[0].ref;
      await docRef.update(resultData);
      resultId = docRef.id;
      console.log(`[RESULTS] Updated existing result: ${resultId}`);
    } else {
      // Create new result
      const newDocRef = await db.collection('results').add(resultData);
      resultId = newDocRef.id;
      console.log(`[RESULTS] Created new result: ${resultId}`);
    }

    // Mark the match as played (gespeeld=1)
    console.log('[RESULTS] Marking match as played...');
    const matchSnapshot = await queryWithOrgComp(
      db.collection('matches') as any,
      orgNummer,
      compNumber,
      [{ field: 'uitslag_code', op: '==', value: uitslag_code }]
    );

    if (!matchSnapshot.empty) {
      await matchSnapshot.docs[0].ref.update({ gespeeld: 1 });
      console.log('[RESULTS] Match marked as played');
    }

    // Invalidate standings cache for this competition
    standingsCache.invalidateCompetition(orgNummer, compNumber);
    console.log('[RESULTS] Invalidated standings cache for competition', compNumber);

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

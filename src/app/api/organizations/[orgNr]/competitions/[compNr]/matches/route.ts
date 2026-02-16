import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateOrgAccess } from '@/lib/auth-helper';
import { scheduleRoundRobinEven, scheduleRoundRobinOdd, generateMatchCode, formatPlayerName } from '@/lib/billiards';
import { queryWithOrgComp } from '@/lib/firestoreUtils';
import { batchEnrichPlayerNames } from '@/lib/batchEnrichment';

interface RouteParams {
  params: Promise<{ orgNr: string; compNr: string }>;
}

/**
 * GET /api/organizations/:orgNr/competitions/:compNr/matches
 * List all matches in a competition
 *
 * Query params:
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
    const periodeParam = searchParams.get('periode');

    // Build additional filters
    const additionalFilters: Array<{ field: string; op: FirebaseFirestore.WhereFilterOp; value: any }> = [];

    if (periodeParam !== null) {
      const periode = parseInt(periodeParam, 10);
      if (!isNaN(periode)) {
        additionalFilters.push({ field: 'periode', op: '==', value: periode });
        console.log('[MATCHES] Filtering by periode:', periode);
      }
    }

    console.log('[MATCHES] Querying database for matches of competition:', compNumber, 'in org:', orgNummer);
    const snapshot = await queryWithOrgComp(
      db.collection('matches'),
      orgNummer,
      compNumber,
      additionalFilters
    );

    const matches: Record<string, unknown>[] = [];
    snapshot.docs.forEach((doc) => {
      matches.push({ id: doc.id, ...doc.data() });
    });

    // Sort by uitslag_code for consistent display
    matches.sort((a, b) => {
      const codeA = (a.uitslag_code as string) || '';
      const codeB = (b.uitslag_code as string) || '';
      return codeA.localeCompare(codeB);
    });

    console.log(`[MATCHES] Found ${matches.length} matches for competition ${compNumber}`);
    return NextResponse.json({
      matches,
      count: matches.length,
    });
  } catch (error) {
    console.error('[MATCHES] Error fetching matches:', error);
    return NextResponse.json(
      { error: 'Fout bij ophalen wedstrijden', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/organizations/:orgNr/competitions/:compNr/matches
 * Generate Round Robin match schedule
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

    // Get competition details
    console.log('[MATCHES] Fetching competition details...');
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
    const discipline = Number(compData?.discipline) || 1;
    const periode = Number(compData?.periode) || 1;
    const sorteren = Number(compData?.sorteren) || 1;

    // Get discipline-specific caramboles key
    const carKeyMap: Record<number, string> = {
      1: 'spc_car_1', 2: 'spc_car_2', 3: 'spc_car_3', 4: 'spc_car_4', 5: 'spc_car_5',
    };
    const carKey = carKeyMap[discipline] || 'spc_car_1';

    // Get all players in the competition
    console.log('[MATCHES] Fetching players...');
    const playersSnapshot = await queryWithOrgComp(
      db.collection('competition_players'),
      orgNummer,
      compNumber,
      [],
      'spc_org',
      'spc_competitie'
    );

    const players: Array<{
      nummer: number;
      naam: string;
      caramboles: number;
      vnaam: string;
      tv: string;
      anaam: string;
    }> = [];

    // Process each player with fallback to members collection
    for (const doc of playersSnapshot.docs) {
      const data = doc.data();
      if (!data) continue;

      let vnaam = data.spa_vnaam;
      let tv = data.spa_tv;
      let anaam = data.spa_anaam;

      // Check if name fields are missing or empty
      const hasEmptyName = !vnaam || !anaam;
      const nummer = Number(data.spc_nummer) || 0;

      if (hasEmptyName && nummer) {
        // Look up member name from members collection
        console.log(`[MATCHES] Player ${nummer} has empty name, looking up from members...`);
        const memberSnapshot = await queryWithOrgComp(
          db.collection('members'),
          orgNummer,
          null,
          [{ field: 'spa_nummer', op: '==', value: nummer }],
          'spa_org'
        );

        if (!memberSnapshot.empty) {
          const memberData = memberSnapshot.docs[0].data();
          vnaam = memberData?.spa_vnaam;
          tv = memberData?.spa_tv;
          anaam = memberData?.spa_anaam;
          console.log(`[MATCHES] Enriched player ${nummer} with member name`);
        }
      }

      players.push({
        nummer,
        naam: formatPlayerName(vnaam, tv, anaam, sorteren),
        caramboles: Number(data[carKey]) || 0,
        vnaam: String(vnaam || ''),
        tv: String(tv || ''),
        anaam: String(anaam || ''),
      });
    }

    if (players.length < 2) {
      return NextResponse.json(
        { error: 'Minimaal 2 spelers nodig voor het genereren van wedstrijden' },
        { status: 400 }
      );
    }

    // Check if matches already exist
    const existingMatches = await queryWithOrgComp(
      db.collection('matches'),
      orgNummer,
      compNumber
    );

    // Parse optional body for regeneration flag
    let forceRegenerate = false;
    try {
      const body = await request.json();
      forceRegenerate = body?.force === true;
    } catch {
      // No body or invalid JSON, that's fine
    }

    if (!existingMatches.empty && !forceRegenerate) {
      return NextResponse.json(
        { error: 'Er bestaan al wedstrijden voor deze competitie. Gebruik force=true om opnieuw te genereren.' },
        { status: 409 }
      );
    }

    // Delete existing matches if regenerating
    if (!existingMatches.empty && forceRegenerate) {
      console.log('[MATCHES] Deleting existing matches...');
      const allExisting = await queryWithOrgComp(
        db.collection('matches'),
        orgNummer,
        compNumber
      );

      for (const doc of allExisting.docs) {
        await doc.ref.delete();
      }
      console.log('[MATCHES] Deleted existing matches.');
    }

    // Generate Round Robin schedule
    const playerNumbers = players.map((p) => p.nummer);
    const isEven = playerNumbers.length % 2 === 0;

    console.log(`[MATCHES] Generating Round Robin schedule for ${playerNumbers.length} players (${isEven ? 'even' : 'odd'})...`);

    let roundsMatches: [number, number][][];

    if (isEven) {
      roundsMatches = scheduleRoundRobinEven(playerNumbers);
    } else {
      const result = scheduleRoundRobinOdd(playerNumbers);
      roundsMatches = result.matches;
    }

    // Build player lookup for fast access
    const playerLookup = new Map(players.map((p) => [p.nummer, p]));

    // Create match documents
    const createdMatches: Record<string, unknown>[] = [];
    const createdPairings = new Set<string>(); // Track created pairings to prevent duplicates

    for (let roundIdx = 0; roundIdx < roundsMatches.length; roundIdx++) {
      const round = roundsMatches[roundIdx];
      for (const [playerANr, playerBNr] of round) {
        const playerA = playerLookup.get(playerANr);
        const playerB = playerLookup.get(playerBNr);

        if (!playerA || !playerB) continue;

        // Create a normalized pairing key (always smaller number first)
        const pairingKey = playerANr < playerBNr
          ? `${periode}_${playerANr}_${playerBNr}`
          : `${periode}_${playerBNr}_${playerANr}`;

        // Check if this pairing already exists in this batch
        if (createdPairings.has(pairingKey)) {
          console.log(`[MATCHES] Skipping duplicate pairing: ${playerA.naam} vs ${playerB.naam} in period ${periode}`);
          continue;
        }

        // Check if this pairing already exists in the database
        const existingPairing = await db.collection('matches')
          .where('org_nummer', '==', orgNummer)
          .where('comp_nr', '==', compNumber)
          .where('periode', '==', periode)
          .get();

        let isDuplicate = false;
        existingPairing.forEach((doc) => {
          const data = doc.data();
          if (!data) return;
          const numA = Number(data.nummer_A);
          const numB = Number(data.nummer_B);
          // Check both directions: A vs B and B vs A
          if ((numA === playerANr && numB === playerBNr) ||
              (numA === playerBNr && numB === playerANr)) {
            isDuplicate = true;
          }
        });

        if (isDuplicate) {
          console.log(`[MATCHES] Skipping duplicate pairing (already in DB): ${playerA.naam} vs ${playerB.naam} in period ${periode}`);
          continue;
        }

        const matchCode = generateMatchCode(periode, playerANr, playerBNr);

        const matchData = {
          org_nummer: orgNummer,
          comp_nr: compNumber,
          nummer_A: playerANr,
          naam_A: playerA.naam,
          cartem_A: playerA.caramboles,
          tafel: '000000000000', // No table assigned yet (binary string, 12 tables)
          nummer_B: playerBNr,
          naam_B: playerB.naam,
          cartem_B: playerB.caramboles,
          periode: periode,
          uitslag_code: matchCode,
          gespeeld: 0, // Not played yet
          ronde: roundIdx + 1, // Round number for display
        };

        console.log(`[MATCHES] Creating match: ${playerA.naam} vs ${playerB.naam} (${matchCode})`);
        const docRef = await db.collection('matches').add(matchData);
        createdMatches.push({ id: docRef.id, ...matchData });
        createdPairings.add(pairingKey); // Track this pairing
      }
    }

    const totalExpectedMatches = (playerNumbers.length * (playerNumbers.length - 1)) / 2;
    console.log(`[MATCHES] Created ${createdMatches.length} matches (expected: ${totalExpectedMatches})`);

    return NextResponse.json({
      matches: createdMatches,
      count: createdMatches.length,
      rounds: roundsMatches.length,
      players: playerNumbers.length,
      message: `${createdMatches.length} wedstrijden succesvol gegenereerd (${roundsMatches.length} rondes)`,
    }, { status: 201 });
  } catch (error) {
    console.error('[MATCHES] Error generating matches:', error);
    return NextResponse.json(
      { error: 'Fout bij genereren wedstrijden', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

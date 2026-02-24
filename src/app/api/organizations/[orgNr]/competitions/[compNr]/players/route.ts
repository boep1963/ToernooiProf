import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateOrgAccess } from '@/lib/auth-helper';
import { calculateCaramboles, getMoyenneField } from '@/lib/billiards';
import { queryWithOrgComp } from '@/lib/firestoreUtils';
import { batchEnrichPlayerNames } from '@/lib/batchEnrichment';

interface RouteParams {
  params: Promise<{ orgNr: string; compNr: string }>;
}

/**
 * GET /api/organizations/:orgNr/competitions/:compNr/players
 * List all players in a competition
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

    console.log('[PLAYERS] Querying database for players of competition:', compNumber, 'in org:', orgNummer);
    const snapshot = await queryWithOrgComp(
      db.collection('competition_players'),
      orgNummer,
      compNumber,
      [],
      'spc_org',
      'spc_competitie'
    );

    // Prepare players with document references for batch enrichment
    const playersToEnrich = snapshot.docs.map(doc => ({
      id: doc.id,
      ref: doc.ref,
      ...doc.data()
    }));

    // Use batch enrichment to fetch all missing names efficiently
    // persistToFirestore=true ensures names are cached for future requests
    const enrichedPlayers = await batchEnrichPlayerNames(
      orgNummer,
      playersToEnrich,
      true // persist to Firestore
    );

    console.log(`[PLAYERS] Found ${enrichedPlayers.length} players for competition ${compNumber}`);
    return NextResponse.json({
      players: enrichedPlayers,
      count: enrichedPlayers.length,
    });
  } catch (error) {
    console.error('[PLAYERS] Error fetching players:', error);
    return NextResponse.json(
      { error: 'Fout bij ophalen spelers', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/organizations/:orgNr/competitions/:compNr/players
 * Add a member (or multiple members) as player(s) to a competition
 * Body: { spc_nummer: number } OR { spc_nummers: number[] }
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

    // Support both single and bulk operations
    const isBulk = Array.isArray(body.spc_nummers);
    const memberNummers = isBulk ? body.spc_nummers : [Number(body.spc_nummer)];

    if (!memberNummers || memberNummers.length === 0 || memberNummers.some((n) => !n)) {
      return NextResponse.json(
        { error: 'Speler nummer(s) zijn verplicht' },
        { status: 400 }
      );
    }

    // Get competition details for caramboles calculation
    console.log('[PLAYERS] Fetching competition details for caramboles calculation...');
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
    const discipline = (compData?.discipline as number) || 1;
    const moyForm = (compData?.moy_form as number) || 3;
    const minCar = (compData?.min_car as number) || 10;
    const currentPeriod = (compData?.periode as number) || 1;

    const addedPlayers = [];
    const errors = [];

    // Process each member
    for (const memberNummer of memberNummers) {
      try {
        // Check if player is already in this competition
        console.log(`[PLAYERS] Checking for duplicate player ${memberNummer}...`);
        const existingCheck = await queryWithOrgComp(
          db.collection('competition_players'),
          orgNummer,
          compNumber,
          [{ field: 'spc_nummer', op: '==', value: memberNummer }],
          'spc_org',
          'spc_competitie'
        );

        if (!existingCheck.empty) {
          errors.push({ spc_nummer: memberNummer, error: 'Al toegevoegd' });
          continue;
        }

        // Get member details for moyenne
        console.log(`[PLAYERS] Fetching member ${memberNummer} details for moyenne...`);
        const memberSnapshot = await queryWithOrgComp(
          db.collection('members'),
          orgNummer,
          null,
          [{ field: 'spa_nummer', op: '==', value: memberNummer }],
          'spa_org'
        );

        if (memberSnapshot.empty) {
          errors.push({ spc_nummer: memberNummer, error: 'Lid niet gevonden' });
          continue;
        }

        const memberData = memberSnapshot.docs[0].data();

        // Get the moyenne for the competition's discipline from the member record
        const moyenneField = getMoyenneField(discipline);
        const moyenne = Number(memberData?.[moyenneField] as number) || 0;

        // Calculate caramboles: moyenne × formula_multiplier, with minimum enforcement
        const caramboles = calculateCaramboles(moyenne, moyForm, minCar);

        // Build moyennes for all 5 PERIODS (not disciplines)
        // Periods before current period get 0.000
        // Current period and later periods get the moyenne from Ledenbeheer
        // Example: if currentPeriod=3, then periode 1,2 get 0, and periode 3,4,5 get moyenne
        const spc_moyenne_1 = currentPeriod <= 1 ? moyenne : 0;
        const spc_moyenne_2 = currentPeriod <= 2 ? moyenne : 0;
        const spc_moyenne_3 = currentPeriod <= 3 ? moyenne : 0;
        const spc_moyenne_4 = currentPeriod <= 4 ? moyenne : 0;
        const spc_moyenne_5 = currentPeriod <= 5 ? moyenne : 0;

        // Calculate caramboles for all periods based on the period moyenne
        const spc_car_1 = calculateCaramboles(spc_moyenne_1, moyForm, minCar);
        const spc_car_2 = calculateCaramboles(spc_moyenne_2, moyForm, minCar);
        const spc_car_3 = calculateCaramboles(spc_moyenne_3, moyForm, minCar);
        const spc_car_4 = calculateCaramboles(spc_moyenne_4, moyForm, minCar);
        const spc_car_5 = calculateCaramboles(spc_moyenne_5, moyForm, minCar);

        const playerData = {
          spc_nummer: memberNummer,
          spc_org: orgNummer,
          spc_competitie: compNumber,
          spc_moyenne_1,
          spc_moyenne_2,
          spc_moyenne_3,
          spc_moyenne_4,
          spc_moyenne_5,
          spc_car_1,
          spc_car_2,
          spc_car_3,
          spc_car_4,
          spc_car_5,
          // Store the member name for display purposes - use String() to ensure no undefined
          spa_vnaam: String(memberData?.spa_vnaam || ''),
          spa_tv: String(memberData?.spa_tv || ''),
          spa_anaam: String(memberData?.spa_anaam || ''),
          created_at: new Date().toISOString(),
        };

        console.log(`[PLAYERS] Adding player ${memberNummer} to competition ${compNumber}, discipline moyenne: ${moyenne}, caramboles: ${caramboles}`);
        const docRef = await db.collection('competition_players').add(playerData);

        addedPlayers.push({
          id: docRef.id,
          ...playerData,
          discipline_moyenne: moyenne,
          discipline_caramboles: caramboles,
        });

        console.log(`[PLAYERS] Player ${memberNummer} added successfully with doc ID:`, docRef.id);
      } catch (error) {
        console.error(`[PLAYERS] Error adding player ${memberNummer}:`, error);
        errors.push({ spc_nummer: memberNummer, error: 'Fout bij toevoegen' });
      }
    }

    // Return appropriate response based on results
    if (addedPlayers.length === 0) {
      return NextResponse.json(
        { error: 'Geen spelers toegevoegd', details: errors },
        { status: 400 }
      );
    }

    if (isBulk) {
      return NextResponse.json({
        players: addedPlayers,
        count: addedPlayers.length,
        errors: errors.length > 0 ? errors : undefined,
        message: `${addedPlayers.length} speler(s) succesvol toegevoegd aan competitie`,
      }, { status: 201 });
    } else {
      // Single player response (backward compatibility)
      const player = addedPlayers[0];
      return NextResponse.json({
        ...player,
        message: 'Speler succesvol toegevoegd aan competitie',
      }, { status: 201 });
    }
  } catch (error) {
    console.error('[PLAYERS] Error adding player:', error);
    return NextResponse.json(
      { error: 'Fout bij toevoegen speler', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/organizations/:orgNr/competitions/:compNr/players
 * Remove a player from a competition with cascade delete of results and matches
 * Body: { spc_nummer: number } - the member number to remove
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
    const memberNummer = Number(body.spc_nummer);

    if (!memberNummer) {
      return NextResponse.json(
        { error: 'Speler nummer is verplicht' },
        { status: 400 }
      );
    }

    // Find the player in this competition
    console.log(`[PLAYERS] Looking for player ${memberNummer} in competition ${compNumber}...`);
    const playerSnapshot = await queryWithOrgComp(
      db.collection('competition_players'),
      orgNummer,
      compNumber,
      [{ field: 'spc_nummer', op: '==', value: memberNummer }],
      'spc_org',
      'spc_competitie'
    );

    if (playerSnapshot.empty) {
      return NextResponse.json(
        { error: 'Speler niet gevonden in deze competitie' },
        { status: 404 }
      );
    }

    const playerDoc = playerSnapshot.docs[0];
    const playerData = playerDoc.data();

    // CASCADE DELETE: Delete all related data

    // 1. Delete results where this player participated (sp_1_nr OR sp_2_nr)
    // Use two queries instead of fetching all results and filtering client-side
    console.log(`[PLAYERS] Deleting results for player ${memberNummer}...`);
    const resultsAsPlayer1 = await queryWithOrgComp(
      db.collection('results'),
      orgNummer,
      compNumber,
      [{ field: 'sp_1_nr', op: '==', value: memberNummer }]
    );

    const resultsAsPlayer2 = await queryWithOrgComp(
      db.collection('results'),
      orgNummer,
      compNumber,
      [{ field: 'sp_2_nr', op: '==', value: memberNummer }]
    );

    // Combine results and deduplicate by document ID
    const resultsMap = new Map();
    resultsAsPlayer1.docs.forEach(doc => resultsMap.set(doc.id, doc));
    resultsAsPlayer2.docs.forEach(doc => resultsMap.set(doc.id, doc));
    const resultsToDelete = Array.from(resultsMap.values());

    console.log(`[PLAYERS] Found ${resultsToDelete.length} results to delete`);
    for (const resultDoc of resultsToDelete) {
      await resultDoc.ref.delete();
    }

    // 2. Delete matches where this player is involved (nummer_A OR nummer_B)
    // Use two queries instead of fetching all matches and filtering client-side
    console.log(`[PLAYERS] Deleting matches for player ${memberNummer}...`);
    const matchesAsPlayerA = await queryWithOrgComp(
      db.collection('matches'),
      orgNummer,
      compNumber,
      [{ field: 'nummer_A', op: '==', value: memberNummer }]
    );

    const matchesAsPlayerB = await queryWithOrgComp(
      db.collection('matches'),
      orgNummer,
      compNumber,
      [{ field: 'nummer_B', op: '==', value: memberNummer }]
    );

    // Combine matches and deduplicate by document ID
    const matchesMap = new Map();
    matchesAsPlayerA.docs.forEach(doc => matchesMap.set(doc.id, doc));
    matchesAsPlayerB.docs.forEach(doc => matchesMap.set(doc.id, doc));
    const matchesToDelete = Array.from(matchesMap.values());

    console.log(`[PLAYERS] Found ${matchesToDelete.length} matches to delete`);
    for (const matchDoc of matchesToDelete) {
      await matchDoc.ref.delete();
    }

    // 3. Delete the player record itself
    await playerDoc.ref.delete();

    console.log(`[PLAYERS] Player ${memberNummer} and all related data removed from competition ${compNumber}`);
    return NextResponse.json({
      message: 'Speler succesvol verwijderd uit competitie',
      spc_nummer: memberNummer,
      player_name: `${playerData?.spa_vnaam || ''} ${playerData?.spa_tv || ''} ${playerData?.spa_anaam || ''}`.trim(),
      deleted_results: resultsToDelete.length,
      deleted_matches: matchesToDelete.length,
    });
  } catch (error) {
    console.error('[PLAYERS] Error removing player:', error);
    return NextResponse.json(
      { error: 'Fout bij verwijderen speler', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

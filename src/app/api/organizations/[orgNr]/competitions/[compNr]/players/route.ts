import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateOrgAccess } from '@/lib/auth-helper';
import { calculateCaramboles, getMoyenneField } from '@/lib/billiards';
import { queryWithOrgComp } from '@/lib/firestoreUtils';

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
      compNumber
    );

    const players: Record<string, unknown>[] = [];

    // Process each player and enrich with member names if missing
    for (const doc of snapshot.docs) {
      const playerData = doc.data();

      // Check if name fields are missing or empty
      const hasEmptyName = !playerData?.spa_vnaam || !playerData?.spa_anaam;

      if (hasEmptyName && playerData?.spc_nummer) {
        // Look up member name from members collection
        console.log(`[PLAYERS] Player ${playerData.spc_nummer} has empty name, looking up from members...`);
        const memberSnapshot = await queryWithOrgComp(
          db.collection('members'),
          orgNummer,
          null,
          [{ field: 'spa_nummer', op: '==', value: playerData.spc_nummer }]
        );

        if (!memberSnapshot.empty) {
          const memberData = memberSnapshot.docs[0].data();
          playerData.spa_vnaam = String(memberData?.spa_vnaam || '');
          playerData.spa_tv = String(memberData?.spa_tv || '');
          playerData.spa_anaam = String(memberData?.spa_anaam || '');
          console.log(`[PLAYERS] Enriched player ${playerData.spc_nummer} with member name`);
        }
      }

      players.push({ id: doc.id, ...playerData });
    }

    console.log(`[PLAYERS] Found ${players.length} players for competition ${compNumber}`);
    return NextResponse.json({
      players,
      count: players.length,
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
          [{ field: 'spc_nummer', op: '==', value: memberNummer }]
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
          [{ field: 'spa_nummer', op: '==', value: memberNummer }]
        );

        if (memberSnapshot.empty) {
          errors.push({ spc_nummer: memberNummer, error: 'Lid niet gevonden' });
          continue;
        }

        const memberData = memberSnapshot.docs[0].data();

        // Get the moyenne for the competition's discipline
        const moyenneField = getMoyenneField(discipline);
        const moyenne = Number(memberData?.[moyenneField] as number) || 0;

        // Calculate caramboles: moyenne × formula_multiplier, with minimum enforcement
        const caramboles = calculateCaramboles(moyenne, moyForm, minCar);

        // Build moyennes for all 5 disciplines from the member
        const spc_moyenne_1 = Number(memberData?.spa_moy_lib) || 0;
        const spc_moyenne_2 = Number(memberData?.spa_moy_band) || 0;
        const spc_moyenne_3 = Number(memberData?.spa_moy_3bkl) || 0;
        const spc_moyenne_4 = Number(memberData?.spa_moy_3bgr) || 0;
        const spc_moyenne_5 = Number(memberData?.spa_moy_kad) || 0;

        // Calculate caramboles for all disciplines (stored in spc_car_1 through spc_car_5)
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
 * Remove a player from a competition
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
      [{ field: 'spc_nummer', op: '==', value: memberNummer }]
    );

    if (playerSnapshot.empty) {
      return NextResponse.json(
        { error: 'Speler niet gevonden in deze competitie' },
        { status: 404 }
      );
    }

    const playerDoc = playerSnapshot.docs[0];
    const playerData = playerDoc.data();

    // Delete the player
    await playerDoc.ref.delete();

    console.log(`[PLAYERS] Player ${memberNummer} removed from competition ${compNumber}`);
    return NextResponse.json({
      message: 'Speler succesvol verwijderd uit competitie',
      spc_nummer: memberNummer,
      player_name: `${playerData?.spa_vnaam || ''} ${playerData?.spa_tv || ''} ${playerData?.spa_anaam || ''}`.trim(),
    });
  } catch (error) {
    console.error('[PLAYERS] Error removing player:', error);
    return NextResponse.json(
      { error: 'Fout bij verwijderen speler', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

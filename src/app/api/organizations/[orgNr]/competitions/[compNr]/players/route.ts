import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { calculateCaramboles, getMoyenneField } from '@/lib/billiards';

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
    const orgNummer = parseInt(orgNr, 10);
    const compNumber = parseInt(compNr, 10);

    if (isNaN(orgNummer) || isNaN(compNumber)) {
      return NextResponse.json(
        { error: 'Ongeldige parameters' },
        { status: 400 }
      );
    }

    console.log('[PLAYERS] Querying database for players of competition:', compNumber, 'in org:', orgNummer);
    const snapshot = await db.collection('competition_players')
      .where('spc_org', '==', orgNummer)
      .where('spc_competitie', '==', compNumber)
      .get();

    const players: Record<string, unknown>[] = [];
    snapshot.forEach((doc) => {
      players.push({ id: doc.id, ...doc.data() });
    });

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
 * Add a member as player to a competition
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
    const memberNummer = Number(body.spc_nummer);

    if (!memberNummer) {
      return NextResponse.json(
        { error: 'Speler nummer is verplicht' },
        { status: 400 }
      );
    }

    // Check if player is already in this competition
    console.log('[PLAYERS] Checking for duplicate player...');
    const existingCheck = await db.collection('competition_players')
      .where('spc_org', '==', orgNummer)
      .where('spc_competitie', '==', compNumber)
      .where('spc_nummer', '==', memberNummer)
      .limit(1)
      .get();

    if (!existingCheck.empty) {
      return NextResponse.json(
        { error: 'Dit lid is al toegevoegd aan deze competitie' },
        { status: 409 }
      );
    }

    // Get competition details for caramboles calculation
    console.log('[PLAYERS] Fetching competition details for caramboles calculation...');
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
    const discipline = compData?.discipline || 1;
    const moyForm = compData?.moy_form || 3;
    const minCar = compData?.min_car || 10;

    // Get member details for moyenne
    console.log('[PLAYERS] Fetching member details for moyenne...');
    const memberSnapshot = await db.collection('members')
      .where('spa_org', '==', orgNummer)
      .where('spa_nummer', '==', memberNummer)
      .limit(1)
      .get();

    if (memberSnapshot.empty) {
      return NextResponse.json(
        { error: 'Lid niet gevonden' },
        { status: 404 }
      );
    }

    const memberData = memberSnapshot.docs[0].data();

    // Get the moyenne for the competition's discipline
    const moyenneField = getMoyenneField(discipline);
    const moyenne = Number(memberData?.[moyenneField]) || 0;

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
      // Store the member name for display purposes
      spa_vnaam: memberData?.spa_vnaam || '',
      spa_tv: memberData?.spa_tv || '',
      spa_anaam: memberData?.spa_anaam || '',
      created_at: new Date().toISOString(),
    };

    console.log(`[PLAYERS] Adding player ${memberNummer} to competition ${compNumber}, discipline moyenne: ${moyenne}, caramboles: ${caramboles}`);
    const docRef = await db.collection('competition_players').add(playerData);

    console.log('[PLAYERS] Player added successfully with doc ID:', docRef.id);
    return NextResponse.json({
      id: docRef.id,
      ...playerData,
      discipline_moyenne: moyenne,
      discipline_caramboles: caramboles,
      message: 'Speler succesvol toegevoegd aan competitie',
    }, { status: 201 });
  } catch (error) {
    console.error('[PLAYERS] Error adding player:', error);
    return NextResponse.json(
      { error: 'Fout bij toevoegen speler', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

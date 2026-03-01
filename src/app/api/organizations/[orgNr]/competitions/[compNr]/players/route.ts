import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateOrgAccess } from '@/lib/auth-helper';
import { calculateCaramboles } from '@/lib/billiards';
import { cachedJsonResponse } from '@/lib/cacheHeaders';

interface RouteParams {
  params: Promise<{ orgNr: string; compNr: string }>;
}

/** Query helper: get spelers for a toernooi */
async function getSpelersForToernooi(orgNummer: number, compNumber: number) {
  return db.collection('spelers')
    .where('gebruiker_nr', '==', orgNummer)
    .where('t_nummer', '==', compNumber)
    .orderBy('sp_nummer', 'asc')
    .get();
}

/**
 * GET /api/organizations/:orgNr/competitions/:compNr/players
 * List all players in a tournament (tp_spelers model)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr, compNr } = await params;

    const authResult = validateOrgAccess(request, orgNr);
    if (authResult instanceof NextResponse) return authResult;
    const orgNummer = authResult.orgNummer;

    const compNumber = parseInt(compNr, 10);
    if (isNaN(compNumber)) {
      return NextResponse.json({ error: 'Ongeldige parameters' }, { status: 400 });
    }

    const snapshot = await getSpelersForToernooi(orgNummer, compNumber);
    const players = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return cachedJsonResponse({ players, count: players.length }, 'default');
  } catch (error) {
    console.error('[SPELERS] Error fetching:', error);
    return NextResponse.json(
      { error: 'Fout bij ophalen spelers', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/organizations/:orgNr/competitions/:compNr/players
 * Add a player to a tournament (tp_spelers model).
 * Body: { sp_naam: string, sp_startmoy: number, sp_startcar?: number }
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr, compNr } = await params;

    const authResult = validateOrgAccess(request, orgNr);
    if (authResult instanceof NextResponse) return authResult;
    const orgNummer = authResult.orgNummer;

    const compNumber = parseInt(compNr, 10);
    if (isNaN(compNumber)) {
      return NextResponse.json({ error: 'Ongeldige parameters' }, { status: 400 });
    }

    const body = await request.json();

    if (!body.sp_naam || typeof body.sp_naam !== 'string' || body.sp_naam.trim() === '') {
      return NextResponse.json({ error: 'Spelernaam is verplicht.' }, { status: 400 });
    }

    // Get tournament details for caramboles calculation
    const compSnap = await db.collection('toernooien')
      .where('org_nummer', '==', orgNummer)
      .where('t_nummer', '==', compNumber)
      .limit(1)
      .get();

    if (compSnap.empty) {
      return NextResponse.json({ error: 'Toernooi niet gevonden' }, { status: 404 });
    }

    const compData = compSnap.docs[0].data();
    if (((compData?.t_gestart as number) ?? 0) === 1) {
      return NextResponse.json({ error: 'Toernooi is al gestart. Spelers toevoegen is niet toegestaan.' }, { status: 409 });
    }
    const tCarSys = (compData?.t_car_sys as number) ?? 1;
    const tMoyForm = (compData?.t_moy_form as number) ?? 3;
    const tMinCar = (compData?.t_min_car as number) ?? 0;

    let sp_startmoy = parseFloat(String(body.sp_startmoy || 0)) || 0;
    let sp_startcar = parseInt(String(body.sp_startcar || 0)) || 0;

    sp_startmoy = Math.max(sp_startmoy, 0.1);

    if (tCarSys === 1) {
      // Moyenne-formule: calculate caramboles from moyenne
      sp_startcar = calculateCaramboles(sp_startmoy, tMoyForm, tMinCar);
    }
    sp_startcar = Math.max(sp_startcar, 3);

    // Generate next sp_nummer for this tournament
    const existingSnap = await getSpelersForToernooi(orgNummer, compNumber);
    let maxSpNummer = 0;
    existingSnap.docs.forEach(doc => {
      const nr = ((doc.data()?.sp_nummer) as number) || 0;
      if (nr > maxSpNummer) maxSpNummer = nr;
    });
    const sp_nummer = maxSpNummer + 1;

    const playerData = {
      gebruiker_nr: orgNummer,
      t_nummer: compNumber,
      sp_nummer,
      sp_naam: body.sp_naam.trim(),
      sp_startmoy,
      sp_startcar,
      created_at: new Date().toISOString(),
    };

    const docRef = await db.collection('spelers').add(playerData);

    // Optioneel: direct toewijzen aan start-poule (ronde 1)
    const hasPouleNr = body.poule_nr !== undefined && body.poule_nr !== null && String(body.poule_nr).trim() !== '';
    const pouleNr = parseInt(String(body.poule_nr || 0), 10);
    if (hasPouleNr && (isNaN(pouleNr) || pouleNr < 1 || pouleNr > 25)) {
      return NextResponse.json({ error: 'Ongeldige poule. Kies een poule tussen 1 en 25.' }, { status: 400 });
    }
    if (pouleNr >= 1 && pouleNr <= 25) {
      const poulesInPoule = await db.collection('poules')
        .where('gebruiker_nr', '==', orgNummer)
        .where('t_nummer', '==', compNumber)
        .where('ronde_nr', '==', 1)
        .where('poule_nr', '==', pouleNr)
        .get();
      const spVolgnr = poulesInPoule.size + 1;
      await db.collection('poules').add({
        gebruiker_nr: orgNummer,
        t_nummer: compNumber,
        sp_nummer,
        sp_moy: sp_startmoy,
        sp_car: sp_startcar,
        sp_volgnr: spVolgnr,
        poule_nr: pouleNr,
        ronde_nr: 1,
      });
    }

    return NextResponse.json({ id: docRef.id, ...playerData, message: 'Speler succesvol toegevoegd.' }, { status: 201 });
  } catch (error) {
    console.error('[SPELERS] Error adding:', error);
    return NextResponse.json(
      { error: 'Fout bij toevoegen speler', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/organizations/:orgNr/competitions/:compNr/players
 * Remove a player and cascade delete related uitslag records.
 * Body: { sp_nummer: number }
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr, compNr } = await params;

    const authResult = validateOrgAccess(request, orgNr);
    if (authResult instanceof NextResponse) return authResult;
    const orgNummer = authResult.orgNummer;

    const compNumber = parseInt(compNr, 10);
    if (isNaN(compNumber)) {
      return NextResponse.json({ error: 'Ongeldige parameters' }, { status: 400 });
    }

    const body = await request.json();
    const spNummer = Number(body.sp_nummer);

    if (!spNummer) {
      return NextResponse.json({ error: 'Spelernummer is verplicht.' }, { status: 400 });
    }

    // Find the player
    const playerSnap = await db.collection('spelers')
      .where('gebruiker_nr', '==', orgNummer)
      .where('t_nummer', '==', compNumber)
      .where('sp_nummer', '==', spNummer)
      .limit(1)
      .get();

    if (playerSnap.empty) {
      return NextResponse.json({ error: 'Speler niet gevonden.' }, { status: 404 });
    }

    const playerDoc = playerSnap.docs[0];
    const playerData = playerDoc.data();

    // Cascade: delete uitslagen where this player participates
    let deletedUitslagen = 0;

    const u1 = await db.collection('uitslagen')
      .where('gebruiker_nr', '==', orgNummer)
      .where('t_nummer', '==', compNumber)
      .where('sp_nummer_1', '==', spNummer)
      .get();
    const u2 = await db.collection('uitslagen')
      .where('gebruiker_nr', '==', orgNummer)
      .where('t_nummer', '==', compNumber)
      .where('sp_nummer_2', '==', spNummer)
      .get();

    const uMap = new Map();
    u1.docs.forEach(d => uMap.set(d.id, d));
    u2.docs.forEach(d => uMap.set(d.id, d));
    for (const doc of uMap.values()) { await doc.ref.delete(); deletedUitslagen++; }

    // Cascade: delete poule entries
    let deletedPoules = 0;
    const poulesSnap = await db.collection('poules')
      .where('gebruiker_nr', '==', orgNummer)
      .where('t_nummer', '==', compNumber)
      .where('sp_nummer', '==', spNummer)
      .get();
    for (const doc of poulesSnap.docs) { await doc.ref.delete(); deletedPoules++; }

    await playerDoc.ref.delete();

    return NextResponse.json({
      message: 'Speler verwijderd.',
      sp_nummer: spNummer,
      sp_naam: playerData?.sp_naam,
      deleted_uitslagen: deletedUitslagen,
      deleted_poules: deletedPoules,
    });
  } catch (error) {
    console.error('[SPELERS] Error removing:', error);
    return NextResponse.json(
      { error: 'Fout bij verwijderen speler', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

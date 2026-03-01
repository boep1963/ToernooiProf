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

async function getTournamentForToernooi(orgNummer: number, compNumber: number) {
  const compSnap = await db.collection('toernooien')
    .where('org_nummer', '==', orgNummer)
    .where('t_nummer', '==', compNumber)
    .limit(1)
    .get();

  if (compSnap.empty) {
    return null;
  }

  const compDoc = compSnap.docs[0];
  return {
    compDoc,
    compData: compDoc.data() ?? {},
  };
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

    const [snapshot, ronde1PouleSnap] = await Promise.all([
      getSpelersForToernooi(orgNummer, compNumber),
      db.collection('poules')
        .where('gebruiker_nr', '==', orgNummer)
        .where('t_nummer', '==', compNumber)
        .where('ronde_nr', '==', 1)
        .get(),
    ]);

    const pouleBySpeler = new Map<number, number>();
    ronde1PouleSnap.docs.forEach((doc) => {
      const data = doc.data() ?? {};
      const spNummer = Number(data.sp_nummer) || 0;
      const pouleNr = Number(data.poule_nr) || 0;
      if (spNummer > 0 && pouleNr > 0 && !pouleBySpeler.has(spNummer)) {
        pouleBySpeler.set(spNummer, pouleNr);
      }
    });

    const players = snapshot.docs.map((doc) => {
      const data = doc.data() ?? {};
      const spNummer = Number(data.sp_nummer) || 0;
      const storedPoule = Number(data.poule_nr) || 0;
      return {
        id: doc.id,
        ...data,
        poule_nr: pouleBySpeler.get(spNummer) ?? (storedPoule > 0 ? storedPoule : 1),
      };
    });

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
    const tournament = await getTournamentForToernooi(orgNummer, compNumber);
    if (!tournament) {
      return NextResponse.json({ error: 'Toernooi niet gevonden' }, { status: 404 });
    }

    const { compData } = tournament;
    if (((compData?.t_gestart as number) ?? 0) === 1) {
      return NextResponse.json({ error: 'Toernooi is al gestart. Spelers toevoegen is niet toegestaan.' }, { status: 409 });
    }

    // Optioneel: direct toewijzen aan start-poule (ronde 1)
    const hasPouleNr = body.poule_nr !== undefined && body.poule_nr !== null && String(body.poule_nr).trim() !== '';
    const pouleNr = parseInt(String(body.poule_nr || 0), 10);
    if (hasPouleNr && (isNaN(pouleNr) || pouleNr < 1 || pouleNr > 25)) {
      return NextResponse.json({ error: 'Ongeldige poule. Kies een poule tussen 1 en 25.' }, { status: 400 });
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
      poule_nr: pouleNr >= 1 && pouleNr <= 25 ? pouleNr : null,
      created_at: new Date().toISOString(),
    };

    const docRef = await db.collection('spelers').add(playerData);

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
 * PUT /api/organizations/:orgNr/competitions/:compNr/players
 * Update a player before tournament start.
 * Body: { sp_nummer, sp_naam, sp_startmoy, sp_startcar, poule_nr }
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
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
    const spNaam = typeof body.sp_naam === 'string' ? body.sp_naam.trim() : '';
    const spStartmoy = Math.max(Number(body.sp_startmoy) || 0, 0.1);
    const pouleNr = parseInt(String(body.poule_nr || 0), 10);

    if (!spNummer) {
      return NextResponse.json({ error: 'Spelernummer is verplicht.' }, { status: 400 });
    }
    if (!spNaam) {
      return NextResponse.json({ error: 'Spelernaam is verplicht.' }, { status: 400 });
    }
    if (isNaN(pouleNr) || pouleNr < 1 || pouleNr > 25) {
      return NextResponse.json({ error: 'Ongeldige poule. Kies een poule tussen 1 en 25.' }, { status: 400 });
    }

    const tournament = await getTournamentForToernooi(orgNummer, compNumber);
    if (!tournament) {
      return NextResponse.json({ error: 'Toernooi niet gevonden' }, { status: 404 });
    }

    if ((Number(tournament.compData?.t_gestart) || 0) === 1) {
      return NextResponse.json({ error: 'Toernooi is al gestart. Spelers wijzigen is niet toegestaan.' }, { status: 409 });
    }

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
    const tCarSys = Number(tournament.compData?.t_car_sys ?? 1);
    const tMoyForm = Number(tournament.compData?.t_moy_form ?? 3);
    const tMinCar = Number(tournament.compData?.t_min_car ?? 0);
    let spStartcar = Math.max(parseInt(String(body.sp_startcar || 0), 10) || 0, 3);
    if (tCarSys === 1) {
      spStartcar = Math.max(calculateCaramboles(spStartmoy, tMoyForm, tMinCar), 3);
    }

    await playerDoc.ref.update({
      sp_naam: spNaam,
      sp_startmoy: spStartmoy,
      sp_startcar: spStartcar,
      poule_nr: pouleNr,
      updated_at: new Date().toISOString(),
    });

    // Sync ronde-1 poulegegevens voor deze speler.
    const ronde1PouleSnap = await db.collection('poules')
      .where('gebruiker_nr', '==', orgNummer)
      .where('t_nummer', '==', compNumber)
      .where('ronde_nr', '==', 1)
      .where('sp_nummer', '==', spNummer)
      .get();

    if (!ronde1PouleSnap.empty) {
      const pouleSnap = await db.collection('poules')
        .where('gebruiker_nr', '==', orgNummer)
        .where('t_nummer', '==', compNumber)
        .where('ronde_nr', '==', 1)
        .where('poule_nr', '==', pouleNr)
        .get();

      const existingInTarget = pouleSnap.docs.filter((doc) => Number(doc.data()?.sp_nummer) !== spNummer);
      const nextVolgNr = existingInTarget.length + 1;

      for (const doc of ronde1PouleSnap.docs) {
        await doc.ref.update({
          poule_nr: pouleNr,
          sp_moy: spStartmoy,
          sp_car: spStartcar,
          sp_volgnr: nextVolgNr,
        });
      }
    }

    return NextResponse.json({
      message: 'Speler succesvol bijgewerkt.',
      sp_nummer: spNummer,
      sp_naam: spNaam,
      sp_startmoy: spStartmoy,
      sp_startcar: spStartcar,
      poule_nr: pouleNr,
    });
  } catch (error) {
    console.error('[SPELERS] Error updating:', error);
    return NextResponse.json(
      { error: 'Fout bij bijwerken speler', details: error instanceof Error ? error.message : 'Unknown' },
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

    const tournament = await getTournamentForToernooi(orgNummer, compNumber);
    if (!tournament) {
      return NextResponse.json({ error: 'Toernooi niet gevonden' }, { status: 404 });
    }
    if ((Number(tournament.compData?.t_gestart) || 0) === 1) {
      return NextResponse.json({ error: 'Toernooi is al gestart. Spelers verwijderen is niet toegestaan.' }, { status: 409 });
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

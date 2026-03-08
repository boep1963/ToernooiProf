import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateOrgAccess } from '@/lib/auth-helper';
import { isSuperAdmin } from '@/lib/admin-shared';

interface RouteParams {
  params: Promise<{ orgNr: string; compNr: string }>;
}

/**
 * POST /api/organizations/:orgNr/competitions/:compNr/players/clear
 * Verwijder in één keer alle spelers (en poule-indeling) van dit toernooi.
 * Alleen voor TEST_-toernooien + super admin, en alleen als het toernooi nog niet gestart is.
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

    const compSnap = await db.collection('toernooien')
      .where('org_nummer', '==', orgNummer)
      .where('t_nummer', '==', compNumber)
      .limit(1)
      .get();

    if (compSnap.empty) {
      return NextResponse.json({ error: 'Toernooi niet gevonden.' }, { status: 404 });
    }

    const compData = compSnap.docs[0].data() ?? {};
    const compNaam = String(compData.t_naam ?? compData.comp_naam ?? '').trim();
    if (!compNaam.toUpperCase().startsWith('TEST_')) {
      return NextResponse.json(
        { error: 'Alleen voor toernooien waarvan de naam met TEST_ begint.' },
        { status: 403 }
      );
    }

    if ((Number(compData.t_gestart) ?? 0) === 1) {
      return NextResponse.json(
        { error: 'Toernooi is al gestart. Alle spelers verwijderen is niet toegestaan.' },
        { status: 409 }
      );
    }

    const orgSnap = await db.collection('organizations').where('org_nummer', '==', orgNummer).limit(1).get();
    if (orgSnap.empty) {
      return NextResponse.json({ error: 'Organisatie niet gevonden.' }, { status: 404 });
    }
    const orgEmail = (orgSnap.docs[0].data()?.org_wl_email as string) ?? '';
    if (!isSuperAdmin(orgEmail)) {
      return NextResponse.json(
        { error: 'Alleen beheerders mogen alle spelers verwijderen voor TEST_-toernooien.' },
        { status: 403 }
      );
    }

    // Verwijder eerst alle poule-regels (ronde 1 voorlopige indeling)
    const poulesSnap = await db.collection('poules')
      .where('gebruiker_nr', '==', orgNummer)
      .where('t_nummer', '==', compNumber)
      .get();
    let deletedPoules = 0;
    for (const doc of poulesSnap.docs) {
      await doc.ref.delete();
      deletedPoules++;
    }

    // Verwijder alle spelers
    const spelersSnap = await db.collection('spelers')
      .where('gebruiker_nr', '==', orgNummer)
      .where('t_nummer', '==', compNumber)
      .get();
    let deletedSpelers = 0;
    for (const doc of spelersSnap.docs) {
      await doc.ref.delete();
      deletedSpelers++;
    }

    return NextResponse.json({
      message: `${deletedSpelers} speler(s) en ${deletedPoules} poule-regel(s) verwijderd.`,
      deleted_spelers: deletedSpelers,
      deleted_poules: deletedPoules,
    });
  } catch (error) {
    console.error('[PLAYERS CLEAR] Error:', error);
    return NextResponse.json(
      { error: 'Fout bij verwijderen spelers', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateOrgAccess } from '@/lib/auth-helper';
import { cachedJsonResponse } from '@/lib/cacheHeaders';

interface RouteParams {
  params: Promise<{ orgNr: string; compNr: string }>;
}

/** Query helper: find toernooi by org_nummer + t_nummer (or comp_nr alias) */
async function findToernooi(orgNummer: number, compNumber: number) {
  const snapshot = await db.collection('toernooien')
    .where('org_nummer', '==', orgNummer)
    .where('t_nummer', '==', compNumber)
    .limit(1)
    .get();
  if (!snapshot.empty) return snapshot.docs[0];

  // Fallback: try comp_nr alias (older documents)
  const fallback = await db.collection('toernooien')
    .where('org_nummer', '==', orgNummer)
    .where('comp_nr', '==', compNumber)
    .limit(1)
    .get();
  return fallback.empty ? null : fallback.docs[0];
}

/**
 * GET /api/organizations/:orgNr/competitions/:compNr
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

    const doc = await findToernooi(orgNummer, compNumber);
    if (!doc) {
      return NextResponse.json({ error: 'Toernooi niet gevonden' }, { status: 404 });
    }

    const data = doc.data() as Record<string, unknown>;

    // Normalise: ensure routing aliases are present
    const normalized = {
      ...data,
      id: doc.id,
      comp_nr: data.t_nummer ?? data.comp_nr,
      comp_naam: data.t_naam ?? data.comp_naam,
      comp_datum: data.t_datum ?? data.comp_datum ?? '',
      punten_sys: data.t_punten_sys ?? data.punten_sys ?? 1,
      moy_form: data.t_moy_form ?? data.moy_form ?? 3,
      min_car: data.t_min_car ?? data.min_car ?? 0,
      max_beurten: data.t_max_beurten ?? data.max_beurten ?? 0,
      periode: data.t_ronde ?? data.periode ?? 0,
    };

    return cachedJsonResponse(normalized, 'default');
  } catch (error) {
    console.error('[TOERNOOI] Error fetching:', error);
    return NextResponse.json({ error: 'Fout bij ophalen toernooi' }, { status: 500 });
  }
}

/**
 * PUT /api/organizations/:orgNr/competitions/:compNr
 * Update editable tournament settings
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

    if (!body.t_naam && !body.comp_naam) {
      return NextResponse.json({ error: 'Toernooinaam is verplicht.' }, { status: 400 });
    }

    const doc = await findToernooi(orgNummer, compNumber);
    if (!doc) {
      return NextResponse.json({ error: 'Toernooi niet gevonden' }, { status: 404 });
    }

    const naam = (body.t_naam ?? body.comp_naam ?? '').trim();
    const datum = body.t_datum ?? body.comp_datum ?? '';

    const updateData: Record<string, unknown> = {
      t_naam: naam,
      comp_naam: naam,
      t_datum: datum,
      comp_datum: datum,
      datum_start: body.datum_start ?? '',
      datum_eind: body.datum_eind ?? '',
      openbaar: Number(body.openbaar) || 0,
      updated_at: new Date().toISOString(),
    };

    await doc.ref.update(updateData);

    return NextResponse.json({
      id: doc.id,
      org_nummer: orgNummer,
      t_nummer: compNumber,
      comp_nr: compNumber,
      ...updateData,
    });
  } catch (error) {
    console.error('[TOERNOOI] Error updating:', error);
    return NextResponse.json({ error: 'Fout bij bijwerken toernooi' }, { status: 500 });
  }
}

/**
 * DELETE /api/organizations/:orgNr/competitions/:compNr
 * Delete tournament and cascade delete all related data
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

    const compDoc = await findToernooi(orgNummer, compNumber);
    if (!compDoc) {
      return NextResponse.json({ error: 'Toernooi niet gevonden' }, { status: 404 });
    }

    const cascadeCounts = { spelers: 0, poules: 0, uitslagen: 0 };

    // Cascade: spelers
    const spelersSnap = await db.collection('spelers')
      .where('gebruiker_nr', '==', orgNummer)
      .where('t_nummer', '==', compNumber)
      .get();
    for (const doc of spelersSnap.docs) { await doc.ref.delete(); cascadeCounts.spelers++; }

    // Cascade: poules
    const poulesSnap = await db.collection('poules')
      .where('gebruiker_nr', '==', orgNummer)
      .where('t_nummer', '==', compNumber)
      .get();
    for (const doc of poulesSnap.docs) { await doc.ref.delete(); cascadeCounts.poules++; }

    // Cascade: uitslagen
    const uitslagenSnap = await db.collection('uitslagen')
      .where('gebruiker_nr', '==', orgNummer)
      .where('t_nummer', '==', compNumber)
      .get();
    for (const doc of uitslagenSnap.docs) { await doc.ref.delete(); cascadeCounts.uitslagen++; }

    await compDoc.ref.delete();

    return NextResponse.json({
      message: 'Toernooi succesvol verwijderd',
      t_nummer: compNumber,
      cascade_deleted: cascadeCounts,
    });
  } catch (error) {
    console.error('[TOERNOOI] Error deleting:', error);
    return NextResponse.json({ error: 'Fout bij verwijderen toernooi' }, { status: 500 });
  }
}

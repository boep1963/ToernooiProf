import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateOrgAccess } from '@/lib/auth-helper';

interface RouteParams {
  params: Promise<{ orgNr: string; compNr: string }>;
}

type DraftItem = {
  sp_nummer: number;
  sp_naam: string;
  from_poule: number;
  to_poule: number;
  moy_start: number;
  car_start: number;
  include: boolean;
  order_idx: number;
};

function getDraftDocId(orgNummer: number, compNumber: number, targetRound: number): string {
  return `${orgNummer}_${compNumber}_${targetRound}`;
}

async function getCompetition(orgNummer: number, compNumber: number) {
  const compSnap = await db.collection('toernooien')
    .where('org_nummer', '==', orgNummer)
    .where('t_nummer', '==', compNumber)
    .limit(1)
    .get();

  if (compSnap.empty) return null;
  return compSnap.docs[0];
}

async function buildDefaultItems(
  orgNummer: number,
  compNumber: number,
  sourceRound: number
): Promise<DraftItem[]> {
  const [poulesSnap, spelersSnap] = await Promise.all([
    db.collection('poules')
      .where('gebruiker_nr', '==', orgNummer)
      .where('t_nummer', '==', compNumber)
      .where('ronde_nr', '==', sourceRound)
      .get(),
    db.collection('spelers')
      .where('gebruiker_nr', '==', orgNummer)
      .where('t_nummer', '==', compNumber)
      .get(),
  ]);

  const spelerNaamByNr = new Map<number, string>();
  spelersSnap.docs.forEach((doc) => {
    const d = (doc.data() ?? {}) as Record<string, unknown>;
    const spNummer = Number(d.sp_nummer) || 0;
    if (spNummer > 0) {
      spelerNaamByNr.set(spNummer, String(d.sp_naam ?? `Speler ${spNummer}`));
    }
  });

  const docs = poulesSnap.docs
    .map((doc) => (doc.data() ?? {}) as Record<string, unknown>)
    .filter((d) => (Number(d.sp_nummer) || 0) > 0)
    .sort((a, b) => {
      const pa = Number(a.poule_nr) || 0;
      const pb = Number(b.poule_nr) || 0;
      if (pa !== pb) return pa - pb;
      return (Number(a.sp_volgnr) || 0) - (Number(b.sp_volgnr) || 0);
    });

  return docs.map((d, idx) => {
    const spNummer = Number(d.sp_nummer) || 0;
    const fromPoule = Number(d.poule_nr) || 1;
    return {
      sp_nummer: spNummer,
      sp_naam: spelerNaamByNr.get(spNummer) || `Speler ${spNummer}`,
      from_poule: fromPoule,
      to_poule: fromPoule,
      moy_start: Number(d.sp_moy) || 0,
      car_start: Number(d.sp_car) || 0,
      include: true,
      order_idx: idx + 1,
    };
  });
}

/**
 * GET /api/organizations/:orgNr/competitions/:compNr/rounds/draft
 * Load (or initialize) server-side draft for next round.
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

    const compDoc = await getCompetition(orgNummer, compNumber);
    if (!compDoc) {
      return NextResponse.json({ error: 'Toernooi niet gevonden' }, { status: 404 });
    }

    const compData = (compDoc.data() ?? {}) as Record<string, unknown>;
    const sourceRound = Number(compData.t_ronde ?? 0) || 0;
    const isStarted = (Number(compData.t_gestart) || 0) === 1;
    if (!isStarted || sourceRound < 1) {
      return NextResponse.json(
        { error: 'Nieuwe ronde aanmaken kan pas vanaf een bestaande gestarte ronde.' },
        { status: 409 }
      );
    }

    const targetRound = sourceRound + 1;
    const draftDocId = getDraftDocId(orgNummer, compNumber, targetRound);
    const draftRef = db.collection('round_drafts').doc(draftDocId);
    const draftSnap = await draftRef.get();

    if (draftSnap.exists) {
      const draftData = (draftSnap.data() ?? {}) as Record<string, unknown>;
      return NextResponse.json({
        draft_exists: true,
        source_ronde: Number(draftData.source_ronde) || sourceRound,
        target_ronde: Number(draftData.target_ronde) || targetRound,
        status: String(draftData.status ?? 'draft'),
        items: Array.isArray(draftData.items) ? draftData.items : [],
      });
    }

    const items = await buildDefaultItems(orgNummer, compNumber, sourceRound);
    const payload = {
      gebruiker_nr: orgNummer,
      t_nummer: compNumber,
      source_ronde: sourceRound,
      target_ronde: targetRound,
      status: 'draft',
      items,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await draftRef.set(payload);

    return NextResponse.json({
      draft_exists: false,
      source_ronde: sourceRound,
      target_ronde: targetRound,
      status: 'draft',
      items,
    });
  } catch (error) {
    console.error('[ROUNDS_DRAFT] GET error:', error);
    return NextResponse.json(
      { error: 'Fout bij ophalen rondeconcept', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/organizations/:orgNr/competitions/:compNr/rounds/draft
 * Upsert full draft item list.
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
    const sourceRound = Number(body.source_ronde || 0) || 0;
    const targetRound = Number(body.target_ronde || 0) || 0;
    const itemsRaw = Array.isArray(body.items) ? body.items : [];

    if (sourceRound < 1 || targetRound < 2 || itemsRaw.length === 0) {
      return NextResponse.json({ error: 'Ongeldige conceptdata' }, { status: 400 });
    }

    const items: DraftItem[] = itemsRaw.map((it: Record<string, unknown>, idx: number) => ({
      sp_nummer: Number(it.sp_nummer) || 0,
      sp_naam: String(it.sp_naam ?? ''),
      from_poule: Number(it.from_poule) || 0,
      to_poule: Number(it.to_poule) || 0,
      moy_start: Number(it.moy_start) || 0,
      car_start: Number(it.car_start) || 0,
      include: Boolean(it.include),
      order_idx: Number(it.order_idx) || idx + 1,
    })).filter((it: DraftItem) => it.sp_nummer > 0);

    const draftDocId = getDraftDocId(orgNummer, compNumber, targetRound);
    await db.collection('round_drafts').doc(draftDocId).set({
      gebruiker_nr: orgNummer,
      t_nummer: compNumber,
      source_ronde: sourceRound,
      target_ronde: targetRound,
      status: 'draft',
      items,
      updated_at: new Date().toISOString(),
    }, { merge: true });

    return NextResponse.json({
      message: 'Concept opgeslagen',
      count: items.length,
    });
  } catch (error) {
    console.error('[ROUNDS_DRAFT] PUT error:', error);
    return NextResponse.json(
      { error: 'Fout bij opslaan rondeconcept', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

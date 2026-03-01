import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateOrgAccess } from '@/lib/auth-helper';

interface RouteParams {
  params: Promise<{ orgNr: string; compNr: string }>;
}

/**
 * POST /api/organizations/:orgNr/competitions/:compNr/rounds/undo
 * Undo the latest round only.
 * Body: { roundNr?: number }
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

    const body = await request.json().catch(() => ({}));
    const requestedRound = Number(body.roundNr || 0) || 0;

    const compSnap = await db.collection('toernooien')
      .where('org_nummer', '==', orgNummer)
      .where('t_nummer', '==', compNumber)
      .limit(1)
      .get();

    if (compSnap.empty) {
      return NextResponse.json({ error: 'Toernooi niet gevonden' }, { status: 404 });
    }

    const compDoc = compSnap.docs[0];
    const compData = compDoc.data() ?? {};
    const currentRound = Number(compData.t_ronde ?? 0) || 0;
    const isStarted = (Number(compData.t_gestart) || 0) === 1;

    if (!isStarted) {
      return NextResponse.json(
        { error: 'Rondebeheer is pas beschikbaar nadat het toernooi is gestart.' },
        { status: 409 }
      );
    }

    if (currentRound < 1) {
      return NextResponse.json({ error: 'Er is geen ronde om terug te draaien.' }, { status: 400 });
    }

    const roundToUndo = requestedRound || currentRound;
    if (roundToUndo !== currentRound) {
      return NextResponse.json({ error: 'Alleen de laatste ronde kan worden teruggedraaid.' }, { status: 409 });
    }

    const [uitslagenSnap, poulesSnap] = await Promise.all([
      db.collection('uitslagen')
        .where('gebruiker_nr', '==', orgNummer)
        .where('t_nummer', '==', compNumber)
        .where('t_ronde', '==', roundToUndo)
        .get(),
      db.collection('poules')
        .where('gebruiker_nr', '==', orgNummer)
        .where('t_nummer', '==', compNumber)
        .where('ronde_nr', '==', roundToUndo)
        .get(),
    ]);

    for (const doc of uitslagenSnap.docs) {
      await doc.ref.delete();
    }
    for (const doc of poulesSnap.docs) {
      await doc.ref.delete();
    }

    const newRound = Math.max(0, currentRound - 1);
    await compDoc.ref.update({
      t_ronde: newRound,
      periode: newRound,
      t_gestart: newRound === 0 ? 0 : 1,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      message: `Ronde ${roundToUndo} is teruggedraaid.`,
      t_ronde: newRound,
      deleted_uitslagen: uitslagenSnap.size,
      deleted_poules: poulesSnap.size,
    });
  } catch (error) {
    console.error('[UNDO ROUND] Error:', error);
    return NextResponse.json(
      { error: 'Fout bij terugdraaien ronde', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

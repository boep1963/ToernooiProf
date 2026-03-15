import { NextResponse } from 'next/server';
import db from '@/lib/db';

type GuardErrorCode = 400 | 403 | 404;

function guardError(message: string, status: GuardErrorCode) {
  return NextResponse.json({ error: message }, { status });
}

export async function assertPouleOwnership(
  orgNummer: number,
  compNumber: number,
  pouleId: string
): Promise<{ ok: true; pouleData: Record<string, unknown> } | NextResponse> {
  if (!pouleId || typeof pouleId !== 'string') {
    return guardError('Ongeldige poule-id.', 400);
  }

  const pouleDoc = await db.collection('poules').doc(pouleId).get();
  if (!pouleDoc.exists) {
    // ToernooiProf gebruikt soms synthetische ids zoals rn1_pn2 i.p.v. document-id.
    const fallbackMatch = pouleId.match(/^rn(\d+)_pn(\d+)$/);
    if (!fallbackMatch) {
      return guardError('Poule niet gevonden.', 404);
    }

    const rondeNr = Number(fallbackMatch[1]);
    const pouleNr = Number(fallbackMatch[2]);
    if (!Number.isInteger(rondeNr) || !Number.isInteger(pouleNr) || rondeNr < 1 || pouleNr < 1) {
      return guardError('Ongeldige poule-id.', 400);
    }

    const fallbackSnap = await db.collection('poules')
      .where('gebruiker_nr', '==', orgNummer)
      .where('t_nummer', '==', compNumber)
      .where('ronde_nr', '==', rondeNr)
      .where('poule_nr', '==', pouleNr)
      .limit(1)
      .get();

    if (fallbackSnap.empty) {
      return guardError('Poule niet gevonden.', 404);
    }

    return {
      ok: true,
      pouleData: (fallbackSnap.docs[0].data() ?? {}) as Record<string, unknown>,
    };
  }

  const pouleData = (pouleDoc.data() ?? {}) as Record<string, unknown>;
  const ownerOrg = Number(pouleData.org_nummer ?? pouleData.gebruiker_nr);
  const ownerComp = Number(pouleData.comp_nr ?? pouleData.t_nummer);

  if (ownerOrg !== orgNummer || ownerComp !== compNumber) {
    return guardError('Geen toegang tot deze poule.', 403);
  }

  return { ok: true, pouleData };
}

export async function assertCompetitionExists(
  orgNummer: number,
  compNumber: number
): Promise<{ ok: true } | NextResponse> {
  const [clubMatchComp, toernooiComp] = await Promise.all([
    db.collection('competitions')
      .where('org_nummer', '==', orgNummer)
      .where('comp_nr', '==', compNumber)
      .limit(1)
      .get(),
    db.collection('toernooien')
      .where('org_nummer', '==', orgNummer)
      .where('t_nummer', '==', compNumber)
      .limit(1)
      .get(),
  ]);

  if (clubMatchComp.empty && toernooiComp.empty) {
    return guardError('Competitie niet gevonden.', 404);
  }
  return { ok: true };
}


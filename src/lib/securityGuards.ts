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
    return guardError('Poule niet gevonden.', 404);
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


import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateSuperAdmin } from '@/lib/admin';
import { normalizeOrgNummer } from '@/lib/orgNumberUtils';

type OrphanCollectionSpec = {
  name: string;
  orgFields: string[];
  tournamentFields: string[];
};

type CollectionDiagnostics = {
  totalDocs: number;
  orphanDocs: number;
  orphanTournamentNumbers: number[];
  sampleDocIds: string[];
};

type OrphanAnalysis = {
  orgNummer: number;
  toernooienFound: number;
  existingTournamentNumbers: number[];
  totalOrphanDocs: number;
  orphanTournamentNumbers: number[];
  byCollection: Record<string, CollectionDiagnostics>;
  orphanDocIdsByCollection: Record<string, string[]>;
};

const COLLECTION_SPECS: OrphanCollectionSpec[] = [
  { name: 'spelers', orgFields: ['gebruiker_nr', 'org_nummer'], tournamentFields: ['t_nummer', 'comp_nr'] },
  { name: 'poules', orgFields: ['gebruiker_nr', 'org_nummer'], tournamentFields: ['t_nummer', 'comp_nr'] },
  { name: 'uitslagen', orgFields: ['gebruiker_nr', 'org_nummer'], tournamentFields: ['t_nummer', 'comp_nr'] },
  { name: 'poule_players', orgFields: ['org_nummer', 'gebruiker_nr'], tournamentFields: ['comp_nr', 't_nummer'] },
  { name: 'results', orgFields: ['org_nummer', 'gebruiker_nr'], tournamentFields: ['comp_nr', 't_nummer'] },
  { name: 'matches', orgFields: ['org_nummer', 'gebruiker_nr'], tournamentFields: ['comp_nr', 't_nummer'] },
  { name: 'competition_players', orgFields: ['spc_org', 'org_nummer', 'gebruiker_nr'], tournamentFields: ['spc_competitie', 'comp_nr', 't_nummer'] },
  { name: 'competitions', orgFields: ['org_nummer', 'gebruiker_nr'], tournamentFields: ['comp_nr', 't_nummer'] },
];

function readFirstNumber(data: Record<string, unknown>, fields: string[]): number | null {
  for (const field of fields) {
    const raw = data[field];
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

async function listDocsByOrg(collectionName: string, orgFields: string[], orgNummer: number) {
  const unique = new Map<string, { id: string; data: Record<string, unknown> }>();
  for (const orgField of orgFields) {
    const snapshot = await db.collection(collectionName)
      .where(orgField, '==', orgNummer)
      .get();
    for (const doc of snapshot.docs) {
      if (!unique.has(doc.id)) {
        unique.set(doc.id, {
          id: doc.id,
          data: (doc.data() ?? {}) as Record<string, unknown>,
        });
      }
    }
  }
  return Array.from(unique.values());
}

async function analyzeOrphans(orgNummer: number): Promise<OrphanAnalysis> {
  const toernooiDocs = await listDocsByOrg('toernooien', ['gebruiker_nr', 'org_nummer'], orgNummer);
  const existingTournamentNumbers = new Set<number>();
  for (const doc of toernooiDocs) {
    const tNummer = readFirstNumber(doc.data, ['t_nummer', 'comp_nr']);
    if (tNummer !== null) existingTournamentNumbers.add(tNummer);
  }

  const byCollection: Record<string, CollectionDiagnostics> = {};
  const orphanDocIdsByCollection: Record<string, string[]> = {};
  const orphanTournamentNumbersSet = new Set<number>();
  let totalOrphanDocs = 0;

  for (const spec of COLLECTION_SPECS) {
    const docs = await listDocsByOrg(spec.name, spec.orgFields, orgNummer);
    const orphanTournamentNumbers = new Set<number>();
    const sampleDocIds: string[] = [];
    const orphanDocIds: string[] = [];
    let orphanDocs = 0;

    for (const doc of docs) {
      const tournamentNr = readFirstNumber(doc.data, spec.tournamentFields);
      if (tournamentNr === null) continue;
      if (!existingTournamentNumbers.has(tournamentNr)) {
        orphanDocs++;
        orphanDocIds.push(doc.id);
        orphanTournamentNumbers.add(tournamentNr);
        orphanTournamentNumbersSet.add(tournamentNr);
        if (sampleDocIds.length < 10) sampleDocIds.push(doc.id);
      }
    }

    totalOrphanDocs += orphanDocs;
    byCollection[spec.name] = {
      totalDocs: docs.length,
      orphanDocs,
      orphanTournamentNumbers: Array.from(orphanTournamentNumbers).sort((a, b) => a - b),
      sampleDocIds,
    };
    orphanDocIdsByCollection[spec.name] = orphanDocIds;
  }

  return {
    orgNummer,
    toernooienFound: existingTournamentNumbers.size,
    existingTournamentNumbers: Array.from(existingTournamentNumbers).sort((a, b) => a - b),
    totalOrphanDocs,
    orphanTournamentNumbers: Array.from(orphanTournamentNumbersSet).sort((a, b) => a - b),
    byCollection,
    orphanDocIdsByCollection,
  };
}

/**
 * GET /api/admin/organizations/:orgNr/orphans
 * Diagnose orphaned tournament-related docs for an organization.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgNr: string }> }
) {
  const authResult = await validateSuperAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { orgNr } = await params;
    const orgNummer = normalizeOrgNummer(orgNr);
    const analysis = await analyzeOrphans(orgNummer);

    return NextResponse.json({
      success: true,
      orgNummer: analysis.orgNummer,
      toernooienFound: analysis.toernooienFound,
      existingTournamentNumbers: analysis.existingTournamentNumbers,
      totalOrphanDocs: analysis.totalOrphanDocs,
      orphanTournamentNumbers: analysis.orphanTournamentNumbers,
      byCollection: analysis.byCollection,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/organizations/:orgNr/orphans
 * Delete orphaned tournament-related docs for an organization.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgNr: string }> }
) {
  const authResult = await validateSuperAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json().catch(() => ({}));
    if (body?.confirm !== true) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bevestiging ontbreekt. Stuur { "confirm": true } om orphaned docs te verwijderen.',
        },
        { status: 400 }
      );
    }

    const { orgNr } = await params;
    const orgNummer = normalizeOrgNummer(orgNr);
    const analysis = await analyzeOrphans(orgNummer);

    const deletedByCollection: Record<string, number> = {};
    let deletedTotal = 0;

    for (const spec of COLLECTION_SPECS) {
      const orphanIds = analysis.orphanDocIdsByCollection[spec.name] ?? [];
      let deletedCount = 0;
      for (const docId of orphanIds) {
        await db.collection(spec.name).doc(docId).delete();
        deletedCount++;
      }
      deletedByCollection[spec.name] = deletedCount;
      deletedTotal += deletedCount;
    }

    return NextResponse.json({
      success: true,
      orgNummer,
      deletedTotal,
      deletedByCollection,
      deletedOrphanTournamentNumbers: analysis.orphanTournamentNumbers,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

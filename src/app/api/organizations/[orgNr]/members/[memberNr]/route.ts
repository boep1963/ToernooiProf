import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateOrgAccess } from '@/lib/auth-helper';
import { cachedJsonResponse } from '@/lib/cacheHeaders';

interface RouteParams {
  params: Promise<{ orgNr: string; memberNr: string }>;
}

/**
 * GET /api/organizations/:orgNr/members/:memberNr
 * Get a specific member
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr, memberNr } = await params;

    // Validate session and org access
    const authResult = validateOrgAccess(request, orgNr);
    if (authResult instanceof NextResponse) return authResult;
    const orgNumber = authResult.orgNummer;

    const memberNumber = parseInt(memberNr, 10);
    if (isNaN(memberNumber)) {
      return NextResponse.json(
        { error: 'Ongeldige parameters' },
        { status: 400 }
      );
    }

    console.log('[MEMBER] Querying database for member:', memberNumber, 'in org:', orgNumber);
    const snapshot = await db.collection('members')
      .where('spa_org', '==', orgNumber)
      .where('spa_nummer', '==', memberNumber)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'Lid niet gevonden' },
        { status: 404 }
      );
    }

    const doc = snapshot.docs[0];
    return cachedJsonResponse({ id: doc.id, ...doc.data() }, 'default');
  } catch (error) {
    console.error('[MEMBER] Error fetching member:', error);
    return NextResponse.json(
      { error: 'Fout bij ophalen lid' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/organizations/:orgNr/members/:memberNr
 * Update a member
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr, memberNr } = await params;

    // Validate session and org access
    const authResult = validateOrgAccess(request, orgNr);
    if (authResult instanceof NextResponse) return authResult;
    const orgNumber = authResult.orgNummer;

    const memberNumber = parseInt(memberNr, 10);
    if (isNaN(memberNumber)) {
      return NextResponse.json(
        { error: 'Ongeldige parameters' },
        { status: 400 }
      );
    }

    const body = await request.json();

    console.log('[MEMBER] Updating member in database:', memberNumber, 'in org:', orgNumber);
    const snapshot = await db.collection('members')
      .where('spa_org', '==', orgNumber)
      .where('spa_nummer', '==', memberNumber)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'Lid niet gevonden' },
        { status: 404 }
      );
    }

    const doc = snapshot.docs[0];
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (body.spa_vnaam !== undefined) updateData.spa_vnaam = body.spa_vnaam;
    if (body.spa_tv !== undefined) updateData.spa_tv = body.spa_tv;
    if (body.spa_anaam !== undefined) updateData.spa_anaam = body.spa_anaam;
    if (body.spa_moy_lib !== undefined) updateData.spa_moy_lib = body.spa_moy_lib;
    if (body.spa_moy_band !== undefined) updateData.spa_moy_band = body.spa_moy_band;
    if (body.spa_moy_3bkl !== undefined) updateData.spa_moy_3bkl = body.spa_moy_3bkl;
    if (body.spa_moy_3bgr !== undefined) updateData.spa_moy_3bgr = body.spa_moy_3bgr;
    if (body.spa_moy_kad !== undefined) updateData.spa_moy_kad = body.spa_moy_kad;

    await doc.ref.update(updateData);

    console.log('[MEMBER] Member updated successfully');
    return NextResponse.json({
      id: doc.id,
      ...doc.data(),
      ...updateData,
      message: 'Lid succesvol bijgewerkt',
    });
  } catch (error) {
    console.error('[MEMBER] Error updating member:', error);
    return NextResponse.json(
      { error: 'Fout bij bijwerken lid' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/organizations/:orgNr/members/:memberNr
 * Delete a member
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr, memberNr } = await params;

    // Validate session and org access
    const authResult = validateOrgAccess(request, orgNr);
    if (authResult instanceof NextResponse) return authResult;
    const orgNumber = authResult.orgNummer;

    const memberNumber = parseInt(memberNr, 10);
    if (isNaN(memberNumber)) {
      return NextResponse.json(
        { error: 'Ongeldige parameters' },
        { status: 400 }
      );
    }

    console.log('[MEMBER] Checking if member can be deleted:', memberNumber, 'in org:', orgNumber);
    const snapshot = await db.collection('members')
      .where('spa_org', '==', orgNumber)
      .where('spa_nummer', '==', memberNumber)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'Lid niet gevonden' },
        { status: 404 }
      );
    }

    // Check if member is linked to any competitions
    console.log('[MEMBER] Checking competition_players for member:', memberNumber);
    const playerSnapshot = await db.collection('competition_players')
      .where('spc_org', '==', orgNumber)
      .where('spc_nummer', '==', memberNumber)
      .get();

    if (!playerSnapshot.empty) {
      // Member is linked to competitions - block deletion and get competition names
      const competitionIds = new Set<number>();
      for (const playerDoc of playerSnapshot.docs) {
        const playerData = (playerDoc.data() ?? {}) as Record<string, unknown>;
        const compId = Number(playerData.spc_competitie) || 0;
        if (compId > 0) {
          competitionIds.add(compId);
        }
      }

      // Fetch competition names
      const competitions: Array<{ comp_nr: number; comp_naam: string }> = [];
      for (const compId of competitionIds) {
        const compSnapshot = await db.collection('competitions')
          .where('org_nummer', '==', orgNumber)
          .where('comp_nr', '==', compId)
          .limit(1)
          .get();

        if (!compSnapshot.empty) {
          const compData = (compSnapshot.docs[0].data() ?? {}) as Record<string, unknown>;
          const compNr = Number(compData.comp_nr) || compId;
          competitions.push({
            comp_nr: compNr,
            comp_naam: String(compData.comp_naam ?? `Competitie ${compNr}`)
          });
        }
      }

      console.log(`[MEMBER] Cannot delete member ${memberNumber}: linked to ${competitions.length} competition(s)`);
      return NextResponse.json(
        {
          error: 'Lid kan niet verwijderd worden',
          message: 'Dit lid is gekoppeld aan één of meer competities. Verwijder eerst het lid uit alle competities.',
          competitions: competitions.sort((a, b) => a.comp_nr - b.comp_nr)
        },
        { status: 409 } // 409 Conflict
      );
    }

    // Member is not linked to any competitions - proceed with deletion
    console.log('[MEMBER] Member not linked to competitions, proceeding with deletion');
    const doc = snapshot.docs[0];
    await doc.ref.delete();

    // Cascade delete: remove all results where this member is player 1 or player 2
    console.log('[MEMBER] Cascade deleting results for member:', memberNumber, 'in org:', orgNumber);
    const resultsSnapshot1 = await db.collection('results')
      .where('org_nummer', '==', orgNumber)
      .where('sp_1_nr', '==', memberNumber)
      .get();

    const resultsSnapshot2 = await db.collection('results')
      .where('org_nummer', '==', orgNumber)
      .where('sp_2_nr', '==', memberNumber)
      .get();

    let deletedResultsCount = 0;
    for (const resultDoc of resultsSnapshot1.docs) {
      await resultDoc.ref.delete();
      deletedResultsCount++;
    }
    for (const resultDoc of resultsSnapshot2.docs) {
      await resultDoc.ref.delete();
      deletedResultsCount++;
    }

    if (deletedResultsCount > 0) {
      console.log(`[MEMBER] Cascade deleted ${deletedResultsCount} results for member ${memberNumber}`);
    }

    // Cascade delete: remove all matches where this member is player A or B
    console.log('[MEMBER] Cascade deleting matches for member:', memberNumber, 'in org:', orgNumber);
    const matchesSnapshotA = await db.collection('matches')
      .where('org_nummer', '==', orgNumber)
      .where('nummer_A', '==', memberNumber)
      .get();

    const matchesSnapshotB = await db.collection('matches')
      .where('org_nummer', '==', orgNumber)
      .where('nummer_B', '==', memberNumber)
      .get();

    let deletedMatchesCount = 0;
    for (const matchDoc of matchesSnapshotA.docs) {
      await matchDoc.ref.delete();
      deletedMatchesCount++;
    }
    for (const matchDoc of matchesSnapshotB.docs) {
      await matchDoc.ref.delete();
      deletedMatchesCount++;
    }

    if (deletedMatchesCount > 0) {
      console.log(`[MEMBER] Cascade deleted ${deletedMatchesCount} matches for member ${memberNumber}`);
    }

    console.log('[MEMBER] Member deleted successfully');
    return NextResponse.json({
      message: 'Lid succesvol verwijderd',
      spa_nummer: memberNumber,
      cascade_deleted_results: deletedResultsCount,
      cascade_deleted_matches: deletedMatchesCount,
    });
  } catch (error) {
    console.error('[MEMBER] Error deleting member:', error);
    return NextResponse.json(
      { error: 'Fout bij verwijderen lid' },
      { status: 500 }
    );
  }
}

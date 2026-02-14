import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateOrgAccess } from '@/lib/auth-helper';

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
    return NextResponse.json({ id: doc.id, ...doc.data() });
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

    console.log('[MEMBER] Deleting member from database:', memberNumber, 'in org:', orgNumber);
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
    await doc.ref.delete();

    // Cascade delete: remove member from all competition_players
    console.log('[MEMBER] Cascade deleting competition_players for member:', memberNumber, 'in org:', orgNumber);
    const playerSnapshot = await db.collection('competition_players')
      .where('spc_org', '==', orgNumber)
      .where('spc_nummer', '==', memberNumber)
      .get();

    let deletedPlayerCount = 0;
    for (const playerDoc of playerSnapshot.docs) {
      await playerDoc.ref.delete();
      deletedPlayerCount++;
    }

    if (deletedPlayerCount > 0) {
      console.log(`[MEMBER] Cascade deleted ${deletedPlayerCount} competition_players entries for member ${memberNumber}`);
    }

    console.log('[MEMBER] Member deleted successfully');
    return NextResponse.json({
      message: 'Lid succesvol verwijderd',
      spa_nummer: memberNumber,
      cascade_deleted_players: deletedPlayerCount,
    });
  } catch (error) {
    console.error('[MEMBER] Error deleting member:', error);
    return NextResponse.json(
      { error: 'Fout bij verwijderen lid' },
      { status: 500 }
    );
  }
}

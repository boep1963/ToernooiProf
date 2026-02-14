import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateOrgAccess } from '@/lib/auth-helper';

interface RouteParams {
  params: Promise<{ orgNr: string }>;
}

/**
 * GET /api/organizations/:orgNr
 * Get organization details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr } = await params;

    // Validate session and org access
    const authResult = validateOrgAccess(request, orgNr);
    if (authResult instanceof NextResponse) return authResult;
    const orgNummer = authResult.orgNummer;

    console.log('[ORG] Querying database for organization:', orgNummer);
    const orgSnapshot = await db.collection('organizations')
      .where('org_nummer', '==', orgNummer)
      .limit(1)
      .get();

    if (orgSnapshot.empty) {
      return NextResponse.json(
        { error: 'Organisatie niet gevonden.' },
        { status: 404 }
      );
    }

    const orgData = orgSnapshot.docs[0].data();

    return NextResponse.json({
      org_nummer: orgData?.org_nummer,
      org_code: orgData?.org_code || '',
      org_naam: orgData?.org_naam,
      org_wl_naam: orgData?.org_wl_naam,
      org_wl_email: orgData?.org_wl_email,
      org_logo: orgData?.org_logo || '',
      aantal_tafels: orgData?.aantal_tafels || 4,
      nieuwsbrief: orgData?.nieuwsbrief || 0,
    });
  } catch (error) {
    console.error('[ORG] Error fetching organization:', error);
    return NextResponse.json(
      { error: 'Fout bij ophalen organisatie.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/organizations/:orgNr
 * Update organization
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr } = await params;

    // Validate session and org access
    const authResult = validateOrgAccess(request, orgNr);
    if (authResult instanceof NextResponse) return authResult;
    const orgNummer = authResult.orgNummer;

    const body = await request.json();

    console.log('[ORG] Updating organization in database:', orgNummer);
    const orgSnapshot = await db.collection('organizations')
      .where('org_nummer', '==', orgNummer)
      .limit(1)
      .get();

    if (orgSnapshot.empty) {
      return NextResponse.json(
        { error: 'Organisatie niet gevonden.' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (body.org_naam !== undefined) updateData.org_naam = body.org_naam;
    if (body.org_wl_naam !== undefined) updateData.org_wl_naam = body.org_wl_naam;
    if (body.org_wl_email !== undefined) updateData.org_wl_email = body.org_wl_email;
    if (body.aantal_tafels !== undefined) updateData.aantal_tafels = body.aantal_tafels;
    if (body.nieuwsbrief !== undefined) updateData.nieuwsbrief = body.nieuwsbrief;

    await orgSnapshot.docs[0].ref.update(updateData);

    console.log('[ORG] Organization updated successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ORG] Error updating organization:', error);
    return NextResponse.json(
      { error: 'Fout bij bijwerken organisatie.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/organizations/:orgNr
 * Delete organization and all related data
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr } = await params;

    // Validate session and org access
    const authResult = validateOrgAccess(request, orgNr);
    if (authResult instanceof NextResponse) return authResult;
    const orgNummer = authResult.orgNummer;

    console.log('[ORG] Deleting organization from database:', orgNummer);
    const orgSnapshot = await db.collection('organizations')
      .where('org_nummer', '==', orgNummer)
      .limit(1)
      .get();

    if (orgSnapshot.empty) {
      return NextResponse.json(
        { error: 'Organisatie niet gevonden.' },
        { status: 404 }
      );
    }

    // Delete members
    const membersSnapshot = await db.collection('members')
      .where('spa_org', '==', orgNummer)
      .get();
    for (const doc of membersSnapshot.docs) {
      await doc.ref.delete();
    }

    // Delete competitions
    const compsSnapshot = await db.collection('competitions')
      .where('org_nummer', '==', orgNummer)
      .get();
    for (const doc of compsSnapshot.docs) {
      await doc.ref.delete();
    }

    // Delete organization
    await orgSnapshot.docs[0].ref.delete();

    console.log('[ORG] Organization and related data deleted');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ORG] Error deleting organization:', error);
    return NextResponse.json(
      { error: 'Fout bij verwijderen organisatie.' },
      { status: 500 }
    );
  }
}

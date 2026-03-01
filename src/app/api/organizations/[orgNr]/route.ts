import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateOrgAccess } from '@/lib/auth-helper';
import { adminAuth } from '@/lib/firebase-admin';
import { cachedJsonResponse } from '@/lib/cacheHeaders';
import { BCC_EMAILS } from '@/lib/emailQueue';

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

    return cachedJsonResponse({
      org_nummer: orgData?.org_nummer,
      org_code: orgData?.org_code || '',
      org_naam: orgData?.org_naam,
      org_wl_naam: orgData?.org_wl_naam,
      org_wl_email: orgData?.org_wl_email,
      org_logo: orgData?.org_logo || '',
      aantal_tafels: orgData?.aantal_tafels || 4,
      nieuwsbrief: orgData?.nieuwsbrief || 0,
    }, 'default');
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

    // Validate email format if email is being updated
    if (body.org_wl_email !== undefined && body.org_wl_email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.org_wl_email.trim())) {
        return NextResponse.json(
          { error: 'Ongeldig e-mailadres formaat.' },
          { status: 400 }
        );
      }
    }

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

    const currentOrgData = orgSnapshot.docs[0].data();
    const currentEmail = currentOrgData?.org_wl_email || '';
    const newEmail = body.org_wl_email;

    // Check if email is changing
    const emailChanged = newEmail !== undefined && newEmail !== currentEmail;

    const updateData: Record<string, unknown> = {};
    if (body.org_naam !== undefined) updateData.org_naam = body.org_naam;
    if (body.org_wl_naam !== undefined) updateData.org_wl_naam = body.org_wl_naam;
    if (body.org_wl_email !== undefined) updateData.org_wl_email = body.org_wl_email;
    if (body.aantal_tafels !== undefined) updateData.aantal_tafels = body.aantal_tafels;
    if (body.nieuwsbrief !== undefined) updateData.nieuwsbrief = body.nieuwsbrief;

    await orgSnapshot.docs[0].ref.update(updateData);

    // If email changed, update Firebase Auth and add entry to email_queue
    if (emailChanged && newEmail && currentEmail) {
      console.log('[ORG] Email changed from', currentEmail, 'to', newEmail);
      const currentEmailStr = String(currentEmail);
      const newEmailStr = String(newEmail);

      // Update Firebase Auth user email (if user exists)
      try {
        const firebaseUser = await adminAuth.getUserByEmail(currentEmailStr);
        if (firebaseUser) {
          console.log('[ORG] Updating Firebase Auth email for user:', firebaseUser.uid);
          await adminAuth.updateUser(firebaseUser.uid, {
            email: newEmailStr,
            emailVerified: true, // Keep email verified after change
          });
          console.log('[ORG] Firebase Auth email updated successfully');
        }
      } catch (authError: unknown) {
        // User might not exist in Firebase Auth (using login code only)
        const errMsg = authError instanceof Error ? authError.message : String(authError);
        console.log('[ORG] Firebase Auth user not found or error updating:', errMsg);
      }

      // Add entry to email_queue for notification
      console.log('[ORG] Adding email change to email_queue');
      await db.collection('email_queue').add({
        type: 'email_change',
        org_nummer: orgNummer,
        old_email: currentEmail,
        new_email: newEmail,
        created_at: new Date().toISOString(),
        processed: false,
        bcc: BCC_EMAILS,
      });
    }

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

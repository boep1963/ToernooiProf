import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateOrgAccess } from '@/lib/auth-helper';
import { getAdminAuth } from '@/lib/firebase-admin';
import { cachedJsonResponse } from '@/lib/cacheHeaders';
import { BCC_EMAILS } from '@/lib/emailQueue';
import { logMutationAudit } from '@/lib/mutationAudit';

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
        const firebaseUser = await getAdminAuth().getUserByEmail(currentEmailStr);
        if (firebaseUser) {
          console.log('[ORG] Updating Firebase Auth email for user:', firebaseUser.uid);
          await getAdminAuth().updateUser(firebaseUser.uid, {
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
      logMutationAudit({
        action: 'delete_organization',
        orgNummer,
        resourceType: 'organizations',
        resourceId: String(orgNummer),
        success: false,
        actor: `org_${orgNummer}`,
        details: { reason: 'not_found' },
      });
      return NextResponse.json(
        { error: 'Organisatie niet gevonden.' },
        { status: 404 }
      );
    }

    const deletedCounts: Record<string, number> = {};

    async function deleteByFields(
      collectionName: string,
      fieldNames: string[],
      value: number
    ): Promise<number> {
      const uniqueDocs = new Map<string, { ref: { delete: () => Promise<void> } }>();

      for (const fieldName of fieldNames) {
        const snapshot = await db.collection(collectionName)
          .where(fieldName, '==', value)
          .get();
        for (const doc of snapshot.docs) {
          if (!uniqueDocs.has(doc.id)) {
            uniqueDocs.set(doc.id, { ref: doc.ref });
          }
        }
      }

      for (const doc of uniqueDocs.values()) {
        await doc.ref.delete();
      }

      return uniqueDocs.size;
    }

    const cascadeTargets: Array<{ collection: string; fields: string[] }> = [
      // ClubMatch-collecties
      { collection: 'members', fields: ['spa_org', 'org_nummer', 'gebruiker_nr'] },
      { collection: 'competitions', fields: ['org_nummer', 'gebruiker_nr'] },
      { collection: 'competition_players', fields: ['spc_org', 'org_nummer', 'gebruiker_nr'] },
      { collection: 'results', fields: ['org_nummer', 'gebruiker_nr'] },
      { collection: 'matches', fields: ['org_nummer', 'gebruiker_nr'] },
      { collection: 'poule_players', fields: ['org_nummer', 'gebruiker_nr'] },
      { collection: 'tables', fields: ['org_nummer', 'gebruiker_nr'] },
      { collection: 'device_config', fields: ['org_nummer', 'gebruiker_nr'] },
      { collection: 'score_helpers', fields: ['org_nummer', 'gebruiker_nr'] },
      { collection: 'score_helpers_tablet', fields: ['org_nummer', 'gebruiker_nr'] },
      { collection: 'email_queue', fields: ['org_nummer', 'gebruiker_nr'] },
      // ToernooiProf-collecties
      { collection: 'toernooien', fields: ['org_nummer', 'gebruiker_nr'] },
      { collection: 'spelers', fields: ['org_nummer', 'gebruiker_nr'] },
      { collection: 'uitslagen', fields: ['org_nummer', 'gebruiker_nr'] },
      { collection: 'poules', fields: ['org_nummer', 'gebruiker_nr'] },
    ];

    for (const target of cascadeTargets) {
      const count = await deleteByFields(target.collection, target.fields, orgNummer);
      deletedCounts[target.collection] = count;
    }

    // Delete organization
    await orgSnapshot.docs[0].ref.delete();
    logMutationAudit({
      action: 'delete_organization',
      orgNummer,
      resourceType: 'organizations',
      resourceId: String(orgNummer),
      success: true,
      actor: `org_${orgNummer}`,
      details: { deleted: deletedCounts },
    });

    console.log('[ORG] Organization and related data deleted', {
      orgNummer,
      deletedCounts,
    });
    return NextResponse.json({
      success: true,
      deleted: deletedCounts,
    });
  } catch (error) {
    const parsedOrg = Number.parseInt((await params).orgNr, 10);
    const orgNummerForAudit = Number.isFinite(parsedOrg) ? parsedOrg : 0;
    logMutationAudit({
      action: 'delete_organization',
      orgNummer: orgNummerForAudit,
      resourceType: 'organizations',
      resourceId: orgNummerForAudit > 0 ? String(orgNummerForAudit) : undefined,
      success: false,
      actor: orgNummerForAudit > 0 ? `org_${orgNummerForAudit}` : 'unknown',
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    console.error('[ORG] Error deleting organization:', error);
    return NextResponse.json(
      { error: 'Fout bij verwijderen organisatie.' },
      { status: 500 }
    );
  }
}

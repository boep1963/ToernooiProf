/**
 * Server-side admin utilities.
 *
 * Re-exports the client-safe helpers from admin-shared.ts and adds
 * server-only validation that depends on database access (Firestore / local).
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// Re-export client-safe helpers so existing server-side imports keep working
export { ADMIN_EMAILS, isSuperAdmin } from '@/lib/admin-shared';

import { isSuperAdmin } from '@/lib/admin-shared';

/**
 * Server-side validation of super admin access.
 * Reads the session cookie, looks up the organization's email from Firestore,
 * and checks it against the ADMIN_EMAILS whitelist.
 *
 * Returns { isSuperAdmin: true, orgNummer } on success,
 * or a 401/403 NextResponse if not authenticated or not a super admin.
 */
export async function validateSuperAdmin(
  request: NextRequest
): Promise<{ isSuperAdmin: true; orgNummer: number } | NextResponse> {
  const sessionCookie = request.cookies.get('clubmatch-session');

  if (!sessionCookie?.value) {
    return NextResponse.json(
      { error: 'Niet ingelogd.' },
      { status: 401 }
    );
  }

  let session: { orgNummer?: number };
  try {
    session = JSON.parse(sessionCookie.value);
  } catch {
    return NextResponse.json(
      { error: 'Ongeldige sessie.' },
      { status: 401 }
    );
  }

  if (!session.orgNummer) {
    return NextResponse.json(
      { error: 'Niet ingelogd.' },
      { status: 401 }
    );
  }

  // Look up the organization's email from Firestore
  const orgSnapshot = await db.collection('organizations')
    .where('org_nummer', '==', session.orgNummer)
    .limit(1)
    .get();

  if (orgSnapshot.empty) {
    return NextResponse.json(
      { error: 'Organisatie niet gevonden.' },
      { status: 404 }
    );
  }

  const orgData = orgSnapshot.docs[0].data();
  const orgEmail = String(orgData?.org_wl_email || '');

  if (!isSuperAdmin(orgEmail)) {
    return NextResponse.json(
      { error: 'Geen beheerderstoegang.' },
      { status: 403 }
    );
  }

  return { isSuperAdmin: true, orgNummer: session.orgNummer };
}

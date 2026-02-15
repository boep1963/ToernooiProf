import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

/**
 * Configurable list of admin emails.
 * - Entries starting with '@' are treated as domain patterns (matched with .includes())
 * - Full email addresses are matched exactly (case-insensitive)
 */
export const ADMIN_EMAILS: string[] = [
  '@de-boer.net',
  'hanseekels@gmail.com',
];

/**
 * Check if an email address belongs to a super admin.
 * Super admins are users whose organization email (org_wl_email) matches
 * any entry in ADMIN_EMAILS — domain patterns use .includes(), full
 * email addresses use exact (case-insensitive) match.
 */
export function isSuperAdmin(email: string | null | undefined): boolean {
  if (!email || typeof email !== 'string') return false;
  const normalizedEmail = email.toLowerCase().trim();
  return ADMIN_EMAILS.some((entry) => {
    const normalizedEntry = entry.toLowerCase().trim();
    if (normalizedEntry.startsWith('@')) {
      // Domain pattern: check if the email contains this domain
      return normalizedEmail.includes(normalizedEntry);
    }
    // Full email address: exact match
    return normalizedEmail === normalizedEntry;
  });
}

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

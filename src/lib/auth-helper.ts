import { NextRequest, NextResponse } from 'next/server';
import { normalizeOrgNummer } from './orgNumberUtils';
import { decodeSessionCookie, SESSION_COOKIE_NAME } from './session';

/**
 * Validates that the authenticated user's organization matches the requested orgNr.
 * Returns the session orgNummer on success, or a 401/403 NextResponse on failure.
 */
export function validateOrgAccess(
  request: NextRequest,
  requestedOrgNr: string | number
): { orgNummer: number } | NextResponse {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return NextResponse.json(
      { error: 'Niet ingelogd.' },
      { status: 401 }
    );
  }

  const session = decodeSessionCookie(sessionCookie.value);
  if (!session?.orgNummer) {
    return NextResponse.json(
      { error: 'Niet ingelogd.' },
      { status: 401 }
    );
  }

  // Normalize both values to ensure consistent comparison
  const requestedOrgNumber = normalizeOrgNummer(requestedOrgNr);
  const sessionOrgNumber = normalizeOrgNummer(session.orgNummer);

  if (sessionOrgNumber !== requestedOrgNumber) {
    return NextResponse.json(
      { error: 'Geen toegang tot deze organisatie.' },
      { status: 403 }
    );
  }

  return { orgNummer: sessionOrgNumber };
}

import { NextRequest, NextResponse } from 'next/server';

/**
 * Validates that the authenticated user's organization matches the requested orgNr.
 * Returns the session orgNummer on success, or a 401/403 NextResponse on failure.
 */
export function validateOrgAccess(
  request: NextRequest,
  requestedOrgNr: string | number
): { orgNummer: number } | NextResponse {
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

  const requestedOrgNumber = typeof requestedOrgNr === 'string'
    ? parseInt(requestedOrgNr, 10)
    : requestedOrgNr;

  if (session.orgNummer !== requestedOrgNumber) {
    return NextResponse.json(
      { error: 'Geen toegang tot deze organisatie.' },
      { status: 403 }
    );
  }

  return { orgNummer: session.orgNummer };
}

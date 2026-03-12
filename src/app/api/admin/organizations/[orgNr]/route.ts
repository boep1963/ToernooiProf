import { NextRequest, NextResponse } from 'next/server';
import { validateSuperAdmin } from '@/lib/admin';
import db from '@/lib/db';
import { cachedJsonResponse } from '@/lib/cacheHeaders';
import { normalizeOrgNummer } from '@/lib/orgNumberUtils';

interface RouteParams {
  params: Promise<{ orgNr: string }>;
}

/**
 * GET /api/admin/organizations/:orgNr
 * Get organization details. Super admin only (no org access check).
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const authResult = await validateSuperAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { orgNr } = await params;
    const orgNummer = normalizeOrgNummer(orgNr);

    const orgSnapshot = await db
      .collection('organizations')
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

    return cachedJsonResponse(
      {
        org_nummer: orgData?.org_nummer,
        org_code: orgData?.org_code ?? '',
        org_naam: orgData?.org_naam,
        org_wl_naam: orgData?.org_wl_naam,
        org_wl_email: orgData?.org_wl_email,
        org_logo: orgData?.org_logo ?? '',
        aantal_tafels: orgData?.aantal_tafels ?? 4,
        nieuwsbrief: orgData?.nieuwsbrief ?? 0,
      },
      'default'
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes('normalizeOrgNummer')) {
      return NextResponse.json(
        { error: 'Ongeldig organisatienummer.' },
        { status: 400 }
      );
    }
    console.error('[ADMIN] Error fetching organization:', error);
    return NextResponse.json(
      { error: 'Fout bij ophalen organisatie.' },
      { status: 500 }
    );
  }
}

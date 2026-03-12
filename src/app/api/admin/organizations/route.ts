import { NextRequest, NextResponse } from 'next/server';
import { validateSuperAdmin } from '@/lib/admin';
import db from '@/lib/db';
import { cachedJsonResponse } from '@/lib/cacheHeaders';

const MAX_RESULTS = 50;

/**
 * GET /api/admin/organizations
 * Search organizations by org_nummer or org_naam prefix. Super admin only.
 * Query: search (optional) – number for exact org_nummer, string for org_naam prefix.
 */
export async function GET(request: NextRequest) {
  const authResult = await validateSuperAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() ?? '';

    if (!search) {
      return cachedJsonResponse({ organizations: [] }, 'no-cache');
    }

    const searchNum = parseInt(search, 10);
    const isNumeric = Number.isFinite(searchNum) && String(searchNum) === search;

    let organizations: Array<{ org_nummer: unknown; org_naam: string; org_code: string; org_wl_email: string }>;

    if (isNumeric) {
      const snapshot = await db
        .collection('organizations')
        .where('org_nummer', '==', searchNum)
        .limit(MAX_RESULTS)
        .get();
      organizations = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          org_nummer: d?.org_nummer,
          org_naam: d?.org_naam ?? '',
          org_code: d?.org_code ?? '',
          org_wl_email: d?.org_wl_email ?? '',
        };
      });
    } else {
      // Tekst: alle orgs ophalen (beperkt) en in-memory filter op naam of e-mail (bevat, hoofdletterongevoelig)
      const snapshot = await db
        .collection('organizations')
        .limit(500)
        .get();
      const searchLower = search.toLowerCase();
      organizations = snapshot.docs
        .map((doc) => {
          const d = doc.data();
          return {
            org_nummer: d?.org_nummer,
            org_naam: (d?.org_naam ?? '') as string,
            org_code: d?.org_code ?? '',
            org_wl_email: (d?.org_wl_email ?? '') as string,
          };
        })
        .filter(
          (org) =>
            org.org_naam.toLowerCase().includes(searchLower) ||
            org.org_wl_email.toLowerCase().includes(searchLower)
        );
    }

    return cachedJsonResponse({ organizations }, 'no-cache');
  } catch (error) {
    console.error('[ADMIN] Error searching organizations:', error);
    return NextResponse.json(
      { error: 'Fout bij zoeken organisaties.' },
      { status: 500 }
    );
  }
}

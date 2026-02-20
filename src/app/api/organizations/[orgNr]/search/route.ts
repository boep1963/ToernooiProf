import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateOrgAccess } from '@/lib/auth-helper';

interface RouteParams {
  params: Promise<{ orgNr: string }>;
}

/**
 * GET /api/organizations/:orgNr/search?q=query
 * Search for members and competitions by name
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr } = await params;

    // Validate session and org access
    const authResult = validateOrgAccess(request, orgNr);
    if (authResult instanceof NextResponse) return authResult;
    const orgNummer = authResult.orgNummer;

    // Get search query from URL params
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        members: [],
        competitions: [],
      });
    }

    const searchTerm = query.trim().toLowerCase();

    // Search members
    const membersSnapshot = await db.collection('members')
      .where('spa_org', '==', orgNummer)
      .get();

    const members = membersSnapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          nummer: data.spa_nummer,
          naam: `${data.spa_voornaam || ''} ${data.spa_achternaam || ''}`.trim(),
          voornaam: data.spa_voornaam,
          achternaam: data.spa_achternaam,
        };
      })
      .filter(member => {
        const fullName = member.naam.toLowerCase();
        const firstName = (member.voornaam || '').toLowerCase();
        const lastName = (member.achternaam || '').toLowerCase();

        return fullName.includes(searchTerm) ||
               firstName.includes(searchTerm) ||
               lastName.includes(searchTerm);
      })
      .slice(0, 10); // Limit to 10 results

    // Search competitions
    const competitionsSnapshot = await db.collection('competitions')
      .where('org_nummer', '==', orgNummer)
      .get();

    const competitions = competitionsSnapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          nummer: data.comp_nr,
          naam: data.comp_naam,
        };
      })
      .filter(comp => {
        const name = (comp.naam || '').toLowerCase();
        return name.includes(searchTerm);
      })
      .slice(0, 10); // Limit to 10 results

    return NextResponse.json({
      members,
      competitions,
    });
  } catch (error) {
    console.error('[SEARCH] Error searching:', error);
    return NextResponse.json(
      { error: 'Fout bij zoeken.' },
      { status: 500 }
    );
  }
}

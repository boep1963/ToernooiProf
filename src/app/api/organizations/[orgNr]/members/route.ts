import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateOrgAccess } from '@/lib/auth-helper';
import { cachedJsonResponse } from '@/lib/cacheHeaders';

interface RouteParams {
  params: Promise<{ orgNr: string }>;
}

/**
 * GET /api/organizations/:orgNr/members
 * List all members for an organization
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr } = await params;

    // Validate session and org access
    const authResult = validateOrgAccess(request, orgNr);
    if (authResult instanceof NextResponse) return authResult;
    const orgNumber = authResult.orgNummer;

    console.log('[MEMBERS] Querying database for members of org:', orgNumber);
    const snapshot = await db.collection('members')
      .where('spa_org', '==', orgNumber)
      .get();

    const members: Record<string, unknown>[] = [];
    snapshot.forEach((doc) => {
      members.push({ id: doc.id, ...doc.data() });
    });

    console.log(`[MEMBERS] Found ${members.length} members for org ${orgNumber}`);
    return cachedJsonResponse({
      members,
      count: members.length,
      org_nummer: orgNumber,
    }, 'default');
  } catch (error) {
    console.error('[MEMBERS] Error fetching members:', error);
    return NextResponse.json(
      { error: 'Fout bij ophalen leden', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/organizations/:orgNr/members
 * Create a new member for an organization
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr } = await params;

    // Validate session and org access
    const authResult = validateOrgAccess(request, orgNr);
    if (authResult instanceof NextResponse) return authResult;
    const orgNumber = authResult.orgNummer;

    const body = await request.json();

    // Validate required fields
    if (!body.spa_vnaam && !body.spa_anaam) {
      return NextResponse.json(
        { error: 'Voornaam of achternaam is verplicht' },
        { status: 400 }
      );
    }

    // Get next member number for this org
    console.log('[MEMBERS] Getting next member number from database...');
    const existingMembers = await db.collection('members')
      .where('spa_org', '==', orgNumber)
      .get();

    let maxNumber = 0;
    existingMembers.forEach((doc) => {
      const data = doc.data();
      if (data && typeof data.spa_nummer === 'number' && data.spa_nummer > maxNumber) {
        maxNumber = data.spa_nummer;
      }
    });

    const memberData = {
      spa_nummer: body.spa_nummer || maxNumber + 1,
      spa_vnaam: body.spa_vnaam || '',
      spa_tv: body.spa_tv || '',
      spa_anaam: body.spa_anaam || '',
      spa_org: orgNumber,
      spa_moy_lib: body.spa_moy_lib || 0,
      spa_moy_band: body.spa_moy_band || 0,
      spa_moy_3bkl: body.spa_moy_3bkl || 0,
      spa_moy_3bgr: body.spa_moy_3bgr || 0,
      spa_moy_kad: body.spa_moy_kad || 0,
      created_at: new Date().toISOString(),
    };

    console.log('[MEMBERS] Creating new member in database:', memberData.spa_nummer);
    const docRef = await db.collection('members').add(memberData);

    console.log('[MEMBERS] Member created with doc ID:', docRef.id);
    return NextResponse.json({
      id: docRef.id,
      ...memberData,
      message: 'Lid succesvol aangemaakt',
    }, { status: 201 });
  } catch (error) {
    console.error('[MEMBERS] Error creating member:', error);
    return NextResponse.json(
      { error: 'Fout bij aanmaken lid', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

/**
 * POST /api/organizations
 * Create a new organization
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const orgNummer = body.org_nummer;
    if (!orgNummer || typeof orgNummer !== 'number') {
      return NextResponse.json(
        { error: 'org_nummer is verplicht en moet een nummer zijn.' },
        { status: 400 }
      );
    }

    // Check if organization already exists
    console.log('[ORG] Checking if organization exists:', orgNummer);
    const existing = await db.collection('organizations')
      .where('org_nummer', '==', orgNummer)
      .limit(1)
      .get();

    if (!existing.empty) {
      return NextResponse.json(
        { error: 'Organisatie met dit nummer bestaat al.' },
        { status: 409 }
      );
    }

    const orgData = {
      org_nummer: orgNummer,
      org_code: body.org_code || '',
      org_naam: body.org_naam || '',
      org_wl_naam: body.org_wl_naam || '',
      org_wl_email: body.org_wl_email || '',
      org_logo: body.org_logo || '',
      aantal_tafels: body.aantal_tafels || 4,
      date_aangemaakt: new Date().toISOString(),
      date_inlog: '',
      nieuwsbrief: body.nieuwsbrief || 0,
      muis_tablet: body.muis_tablet || 1,
      reclame_pagina: body.reclame_pagina || 0,
      aantal_reclames: body.aantal_reclames || 0,
      slideshow_interval: body.slideshow_interval || 10,
      sorteren: body.sorteren || 1,
    };

    console.log('[ORG] Creating new organization in database:', orgNummer);
    const docRef = await db.collection('organizations').add(orgData);

    return NextResponse.json({
      id: docRef.id,
      ...orgData,
      message: 'Organisatie succesvol aangemaakt',
    }, { status: 201 });
  } catch (error) {
    console.error('[ORG] Error creating organization:', error);
    return NextResponse.json(
      { error: 'Fout bij aanmaken organisatie.' },
      { status: 500 }
    );
  }
}

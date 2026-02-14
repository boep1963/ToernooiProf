import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST() {
  try {
    // Check if test organization already exists
    const existing = await db.collection('organizations')
      .where('org_nummer', '==', 1205)
      .limit(1)
      .get();

    if (!existing.empty) {
      return NextResponse.json({ message: 'Test organization already exists', orgNummer: 1205 });
    }

    // Create test organization
    const orgData = {
      org_nummer: 1205,
      org_code: '1205_AAY@#',
      org_naam: 'Test Biljartvereniging',
      org_wl_naam: 'Jan de Vries',
      org_wl_email: 'jan@test.nl',
      org_logo: '',
      aantal_tafels: 4,
      date_aangemaakt: new Date().toISOString(),
      date_inlog: '',
      nieuwsbrief: 1,
      muis_tablet: 1,
      reclame_pagina: 0,
      aantal_reclames: 0,
      slideshow_interval: 10,
      sorteren: 1,
      verified: true,
    };

    await db.collection('organizations').add(orgData);

    return NextResponse.json({
      message: 'Test organization created successfully',
      orgNummer: 1205,
      orgCode: '1205_AAY@#'
    });
  } catch (error) {
    console.error('[SEED] Error:', error);
    return NextResponse.json(
      { error: 'Fout bij initialiseren testdata.' },
      { status: 500 }
    );
  }
}

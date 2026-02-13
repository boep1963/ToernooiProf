import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('clubmatch-session');

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { error: 'Niet ingelogd.' },
        { status: 401 }
      );
    }

    let session;
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
        { error: 'Ongeldige sessie.' },
        { status: 401 }
      );
    }

    // Fetch fresh organization data from database
    console.log('[SESSION] Querying database for organization:', session.orgNummer);
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

    return NextResponse.json({
      orgNummer: session.orgNummer,
      organization: {
        org_nummer: orgData?.org_nummer,
        org_naam: orgData?.org_naam,
        org_wl_naam: orgData?.org_wl_naam,
        org_wl_email: orgData?.org_wl_email,
        org_logo: orgData?.org_logo || '',
        aantal_tafels: orgData?.aantal_tafels || 4,
      },
    });
  } catch (error) {
    console.error('[SESSION] Error checking session:', error);
    return NextResponse.json(
      { error: 'Sessiefout.' },
      { status: 500 }
    );
  }
}

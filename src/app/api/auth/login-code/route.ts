import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Inlogcode is verplicht.' },
        { status: 400 }
      );
    }

    // Query database for organization with this login code
    console.log('[AUTH] Querying database for login code...');
    const orgSnapshot = await db.collection('organizations')
      .where('org_code', '==', code)
      .limit(1)
      .get();

    if (orgSnapshot.empty) {
      console.log('[AUTH] No organization found for login code');
      return NextResponse.json(
        { error: 'Ongeldige inlogcode. Probeer het opnieuw.' },
        { status: 401 }
      );
    }

    const orgDoc = orgSnapshot.docs[0];
    const orgData = orgDoc.data();

    // Update last login date
    console.log('[AUTH] Updating login date in database...');
    await orgDoc.ref.update({
      date_inlog: new Date().toISOString(),
    });

    // Create session response with org data
    const response = NextResponse.json({
      success: true,
      orgNummer: orgData?.org_nummer,
      organization: {
        org_nummer: orgData?.org_nummer,
        org_naam: orgData?.org_naam,
        org_wl_naam: orgData?.org_wl_naam,
        org_wl_email: orgData?.org_wl_email,
        org_logo: orgData?.org_logo || '',
        aantal_tafels: orgData?.aantal_tafels || 4,
      },
    });

    // Set session cookie
    response.cookies.set('clubmatch-session', JSON.stringify({
      orgNummer: orgData?.org_nummer,
      orgNaam: orgData?.org_naam,
      loginTime: new Date().toISOString(),
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    console.log('[AUTH] Login successful for org:', orgData?.org_nummer);
    return response;
  } catch (error) {
    console.error('[AUTH] Login error:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het inloggen.' },
      { status: 500 }
    );
  }
}

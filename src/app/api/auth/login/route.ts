import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-mailadres en wachtwoord zijn verplicht.' },
        { status: 400 }
      );
    }

    // For email/password login: look up org by email in the database
    // Firebase Auth verification happens client-side; server validates org exists
    console.log('[AUTH] Looking up organization by email...');
    const orgSnapshot = await db.collection('organizations')
      .where('org_wl_email', '==', email)
      .limit(1)
      .get();

    if (orgSnapshot.empty) {
      return NextResponse.json(
        { error: 'Geen organisatie gevonden voor dit e-mailadres.' },
        { status: 404 }
      );
    }

    const orgDoc = orgSnapshot.docs[0];
    const orgData = orgDoc.data();

    // Update last login date
    await orgDoc.ref.update({
      date_inlog: new Date().toISOString(),
    });

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

    response.cookies.set('clubmatch-session', JSON.stringify({
      orgNummer: orgData?.org_nummer,
      orgNaam: orgData?.org_naam,
      loginTime: new Date().toISOString(),
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    console.log('[AUTH] Email login successful for org:', orgData?.org_nummer);
    return response;
  } catch (error) {
    console.error('[AUTH] Login error:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het inloggen.' },
      { status: 500 }
    );
  }
}

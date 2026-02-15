import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PATCH(request: NextRequest) {
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

    const { theme } = await request.json();

    if (!theme || (theme !== 'light' && theme !== 'dark')) {
      return NextResponse.json(
        { error: 'Ongeldig thema. Gebruik "light" of "dark".' },
        { status: 400 }
      );
    }

    // Update theme preference in Firestore
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

    const orgDoc = orgSnapshot.docs[0];
    await orgDoc.ref.update({
      theme_preference: theme,
    });

    return NextResponse.json({
      success: true,
      theme,
    });
  } catch (error) {
    console.error('[THEME] Error updating theme:', error);
    return NextResponse.json(
      { error: 'Fout bij het opslaan van thema.' },
      { status: 500 }
    );
  }
}

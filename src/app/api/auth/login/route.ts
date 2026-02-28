import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { adminAuth } from '@/lib/firebase-admin';
import { checkLoginLimit, getClientIp, getUserAgent, rateLimit429 } from '@/lib/rateLimit';
import { isTurnstileConfigured, verifyTurnstileToken } from '@/lib/turnstile';
import { logAuthEvent } from '@/lib/authLog';

export async function POST(request: NextRequest) {
  try {
    // Rate limit per IP before processing
    const limitResult = await checkLoginLimit(request);
    if (!limitResult.allowed) {
      return rateLimit429(limitResult);
    }

    const body = await request.json();
    const { idToken, turnstileToken } = body;

    // When Turnstile is configured and a token is sent, verify it
    if (isTurnstileConfigured() && turnstileToken) {
      const valid = await verifyTurnstileToken(turnstileToken);
      if (!valid) {
        return NextResponse.json(
          { error: 'Onjuiste inloggegevens.' },
          { status: 400 }
        );
      }
    }

    if (!idToken) {
      return NextResponse.json(
        { error: 'Firebase authenticatie token is verplicht.' },
        { status: 400 }
      );
    }

    // Verify Firebase Auth ID token on the server
    console.log('[AUTH] Verifying Firebase Auth ID token...');
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (tokenError) {
      console.error('[AUTH] Token verification failed:', tokenError);
      void logAuthEvent({
        endpoint: 'login',
        success: false,
        ip: getClientIp(request),
        userAgent: getUserAgent(request),
      });
      return NextResponse.json(
        { error: 'Onjuiste inloggegevens.' },
        { status: 401 }
      );
    }

    const email = decodedToken.email;
    if (!email) {
      return NextResponse.json(
        { error: 'Geen e-mailadres gekoppeld aan dit account.' },
        { status: 400 }
      );
    }

    // Look up organization by email in the database
    console.log('[AUTH] Looking up organization by email:', email);
    const orgSnapshot = await db.collection('organizations')
      .where('org_wl_email', '==', email)
      .limit(1)
      .get();

    if (orgSnapshot.empty) {
      void logAuthEvent({
        endpoint: 'login',
        success: false,
        ip: getClientIp(request),
        userAgent: getUserAgent(request),
        identifier: email,
      });
      return NextResponse.json(
        { error: 'Onjuiste inloggegevens.' },
        { status: 401 }
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

    // Set session cookie
    response.cookies.set('toernooiprof-session', JSON.stringify({
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

    console.log('[AUTH] Firebase Auth login successful for org:', orgData?.org_nummer, '(email:', email, ')');
    void logAuthEvent({
      endpoint: 'login',
      success: true,
      ip: getClientIp(request),
      userAgent: getUserAgent(request),
      identifier: email,
    });
    return response;
  } catch (error) {
    console.error('[AUTH] Login error:', error);
    void logAuthEvent({
      endpoint: 'login',
      success: false,
      ip: getClientIp(request),
      userAgent: getUserAgent(request),
    });
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het inloggen.' },
      { status: 500 }
    );
  }
}

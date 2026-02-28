import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import {
  checkLoginCodeLimit,
  getClientIp,
  getUserAgent,
  rateLimit429,
} from '@/lib/rateLimit';
import { isTurnstileConfigured, verifyTurnstileToken } from '@/lib/turnstile';
import { logAuthEvent } from '@/lib/authLog';

export async function POST(request: NextRequest) {
  try {
    const { code, turnstileToken } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Inlogcode is verplicht.' },
        { status: 400 }
      );
    }

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

    // Rate limit: per IP and per code prefix (first 4 chars)
    const codePrefix = code.slice(0, 4);
    const limitResult = await checkLoginCodeLimit(request, codePrefix);
    if (!limitResult.allowed) {
      return rateLimit429(limitResult);
    }

    // Query database for organization with this login code
    console.log('[AUTH] Querying database for login code...');
    const orgSnapshot = await db.collection('organizations')
      .where('org_code', '==', code)
      .limit(1)
      .get();

    if (orgSnapshot.empty) {
      console.log('[AUTH] No organization found for login code');
      void logAuthEvent({
        endpoint: 'login-code',
        success: false,
        ip: getClientIp(request),
        userAgent: getUserAgent(request),
        identifier: codePrefix,
      });
      return NextResponse.json(
        { error: 'Onjuiste inloggegevens.' },
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

    // Create session response with org data from the document we looked up (same org as org_code)
    const response = NextResponse.json({
      success: true,
      orgNummer: orgData?.org_nummer,
      organization: {
        org_nummer: orgData?.org_nummer,
        org_naam: orgData?.org_naam,
        org_wl_naam: orgData?.org_wl_naam,
        org_wl_email: orgData?.org_wl_email,
        org_logo: orgData?.org_logo || '',
        org_code: orgData?.org_code || '',
        aantal_tafels: orgData?.aantal_tafels || 4,
        theme_preference: orgData?.theme_preference,
      },
    });

    // Set session cookie
    const sessionData = {
      orgNummer: orgData?.org_nummer,
      orgNaam: orgData?.org_naam,
      loginTime: new Date().toISOString(),
    };
    response.cookies.set('toernooiprof-session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    console.log('[AUTH] Login successful for org:', orgData?.org_nummer);
    void logAuthEvent({
      endpoint: 'login-code',
      success: true,
      ip: getClientIp(request),
      userAgent: getUserAgent(request),
    });
    return response;
  } catch (error) {
    console.error('[AUTH] Login error:', error);
    void logAuthEvent({
      endpoint: 'login-code',
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

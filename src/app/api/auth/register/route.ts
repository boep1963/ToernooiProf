import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

/**
 * Generate a random string of uppercase letters (excluding I and O for readability)
 */
function generateRandomLetters(length: number): string {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters[Math.floor(Math.random() * characters.length)];
  }
  return result;
}

/**
 * Generate a login code in the format: NNNN_XXX@#
 * where NNNN is the org number and XXX is 3 random uppercase letters
 */
function generateLoginCode(orgNummer: number): string {
  const letters = generateRandomLetters(3);
  return `${orgNummer}_${letters}@#`;
}

/**
 * Generate a 5-digit verification code
 */
function generateVerificationCode(): string {
  return String(Math.floor(10000 + Math.random() * 90000));
}

/**
 * POST /api/auth/register
 * Register a new user account and organization
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { org_naam, org_wl_naam, org_wl_email, aantal_tafels } = body;

    // Validation
    const errors: string[] = [];

    if (!org_naam || typeof org_naam !== 'string' || org_naam.trim().length < 5 || org_naam.trim().length > 30) {
      errors.push('Naam organisatie moet minimaal 5 en maximaal 30 tekens bevatten.');
    }

    if (!org_wl_naam || typeof org_wl_naam !== 'string' || org_wl_naam.trim().length < 5 || org_wl_naam.trim().length > 30) {
      errors.push('Naam contactpersoon moet minimaal 5 en maximaal 30 tekens bevatten.');
    }

    if (!org_wl_email || typeof org_wl_email !== 'string' || org_wl_email.trim().length < 5 || org_wl_email.trim().length > 50) {
      errors.push('E-mailadres moet minimaal 5 en maximaal 50 tekens bevatten.');
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (org_wl_email && !emailRegex.test(org_wl_email.trim())) {
      errors.push('E-mailadres heeft geen geldig formaat.');
    }

    const tafels = Number(aantal_tafels) || 4;
    if (tafels < 1 || tafels > 12) {
      errors.push('Aantal tafels moet tussen 1 en 12 zijn.');
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: errors.join(' '), errors },
        { status: 400 }
      );
    }

    // Check if email already exists
    console.log('[REGISTER] Checking for existing email:', org_wl_email.trim());
    const existingEmail = await db.collection('organizations')
      .where('org_wl_email', '==', org_wl_email.trim())
      .limit(1)
      .get();

    if (!existingEmail.empty) {
      return NextResponse.json(
        { error: 'Met dit e-mailadres is al een account aangemaakt. Neem contact op als u uw inlogcode kwijt bent.' },
        { status: 409 }
      );
    }

    // Determine next org_nummer (max existing + 1, starting from 1000)
    console.log('[REGISTER] Determining next org_nummer...');
    const allOrgs = await db.collection('organizations')
      .orderBy('org_nummer', 'desc')
      .limit(1)
      .get();

    let nextOrgNummer = 1000;
    if (!allOrgs.empty) {
      const maxOrg = allOrgs.docs[0].data();
      nextOrgNummer = ((maxOrg?.org_nummer as number) || 999) + 1;
    }

    // Generate login code
    const loginCode = generateLoginCode(nextOrgNummer);

    // Generate verification code
    const verificationCode = generateVerificationCode();

    // Create organization document
    const orgData = {
      org_nummer: nextOrgNummer,
      org_code: loginCode,
      org_naam: org_naam.trim(),
      org_wl_naam: org_wl_naam.trim(),
      org_wl_email: org_wl_email.trim(),
      org_logo: `Logo_${nextOrgNummer}.jpg`,
      aantal_tafels: tafels,
      date_aangemaakt: new Date().toISOString(),
      date_inlog: new Date().toISOString(),
      nieuwsbrief: 1,
      muis_tablet: 1,
      reclame_pagina: 0,
      aantal_reclames: 0,
      slideshow_interval: 10,
      sorteren: 1,
      verification_code: verificationCode,
      verification_time: Date.now(),
      verified: false,
    };

    console.log('[REGISTER] Creating new organization:', nextOrgNummer);
    await db.collection('organizations').add(orgData);

    // Also create table records (matching PHP behavior)
    for (let t = 1; t <= tafels; t++) {
      await db.collection('tables').add({
        org_nummer: nextOrgNummer,
        tafel_nr: t,
        soort: 1,
      });
    }

    // In development: log the verification code and login code to console
    // (In production, this would be sent via email)
    console.log('============================================');
    console.log(`[EMAIL] Verificatiecode voor ${org_wl_email.trim()}: ${verificationCode}`);
    console.log(`[EMAIL] Deze code is 15 minuten geldig.`);
    console.log(`[REGISTER] Inlogcode: ${loginCode}`);
    console.log(`[REGISTER] Organisatienummer: ${nextOrgNummer}`);
    console.log('============================================');

    // Set session cookie for the new user (unverified state)
    const response = NextResponse.json({
      success: true,
      org_nummer: nextOrgNummer,
      org_code: loginCode,
      org_naam: org_naam.trim(),
      email: org_wl_email.trim(),
      message: 'Account aangemaakt! Verifieer uw e-mailadres om verder te gaan.',
    }, { status: 201 });

    // Set session cookie (unverified - user needs to complete email verification)
    response.cookies.set('clubmatch-session', JSON.stringify({
      orgNummer: nextOrgNummer,
      orgNaam: org_naam.trim(),
      loginTime: new Date().toISOString(),
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[REGISTER] Registration error:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het registreren.' },
      { status: 500 }
    );
  }
}

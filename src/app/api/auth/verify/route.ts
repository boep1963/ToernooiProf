import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { addEmailToQueue, generateVerificationConfirmationEmail } from '@/lib/emailQueue';

/**
 * POST /api/auth/verify
 * Verify a registration with the verification code sent via email
 */
export async function POST(request: NextRequest) {
  try {
    const { email, verification_code } = await request.json();

    if (!email || !verification_code) {
      return NextResponse.json(
        { error: 'E-mailadres en verificatiecode zijn verplicht.' },
        { status: 400 }
      );
    }

    // Find organization with matching email and verification code
    console.log('[VERIFY] Looking up verification for email:', email);
    const orgSnapshot = await db.collection('organizations')
      .where('org_wl_email', '==', email)
      .limit(1)
      .get();

    if (orgSnapshot.empty) {
      return NextResponse.json(
        { error: 'Geen account gevonden met dit e-mailadres.' },
        { status: 404 }
      );
    }

    const orgDoc = orgSnapshot.docs[0];
    const orgData = orgDoc.data();

    // Check if already verified
    if (orgData?.verified === true) {
      return NextResponse.json(
        { error: 'Dit account is al geverifieerd. U kunt inloggen.', already_verified: true },
        { status: 400 }
      );
    }

    // Check verification code
    if (String(orgData?.verification_code) !== String(verification_code)) {
      console.log('[VERIFY] Invalid verification code');
      return NextResponse.json(
        { error: 'Ongeldige verificatiecode.' },
        { status: 401 }
      );
    }

    // Check if verification code is still valid (15 minutes)
    const verificationTime = orgData?.verification_time as number;
    const currentTime = Date.now();
    const fifteenMinutes = 15 * 60 * 1000;

    if (verificationTime && (currentTime - verificationTime) > fifteenMinutes) {
      console.log('[VERIFY] Verification code expired');
      return NextResponse.json(
        { error: 'De verificatiecode is verlopen. Registreer opnieuw.' },
        { status: 410 }
      );
    }

    // Mark as verified
    console.log('[VERIFY] Marking organization as verified:', orgData?.org_nummer);
    await orgDoc.ref.update({
      verified: true,
      verification_code: null,
      verification_time: null,
    });

    // Queue the verification confirmation email
    const confirmationEmail = generateVerificationConfirmationEmail(
      email,
      orgData?.org_naam as string,
      orgData?.org_code as string
    );

    await addEmailToQueue({
      ...confirmationEmail,
      org_nummer: orgData?.org_nummer as number,
    });

    // Log confirmation email (in production this would be sent via email)
    console.log('============================================');
    console.log(`[EMAIL] Verificatie voltooid voor ${email}`);
    console.log(`[EMAIL] Organisatie: ${orgData?.org_naam} (${orgData?.org_code})`);
    console.log('============================================');

    // Set session cookie for the verified user
    const response = NextResponse.json({
      success: true,
      org_nummer: orgData?.org_nummer,
      org_code: orgData?.org_code,
      org_naam: orgData?.org_naam,
      message: 'Verificatie voltooid! U kunt nu volledig gebruikmaken van ClubMatch.',
    });

    // Set session cookie with verified flag
    response.cookies.set('clubmatch-session', JSON.stringify({
      orgNummer: orgData?.org_nummer,
      orgNaam: orgData?.org_naam,
      loginTime: new Date().toISOString(),
      verified: true,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[VERIFY] Verification error:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij de verificatie.' },
      { status: 500 }
    );
  }
}

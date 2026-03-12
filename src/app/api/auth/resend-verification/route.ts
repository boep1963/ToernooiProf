import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { addEmailToQueue, generateRegistrationEmail } from '@/lib/emailQueue';
import { checkResendVerifyLimit, getClientIp, getUserAgent, rateLimit429 } from '@/lib/rateLimit';
import { logAuthEvent } from '@/lib/authLog';

function generateVerificationCode(): string {
  return String(Math.floor(10000 + Math.random() * 90000));
}

/**
 * POST /api/auth/resend-verification
 * Resend the verification code to the given email (unverified org only).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.trim() : '';

    if (!email || email.length < 5) {
      return NextResponse.json(
        { error: 'E-mailadres is verplicht.' },
        { status: 400 }
      );
    }

    const limitResult = await checkResendVerifyLimit(request, email);
    if (!limitResult.allowed) {
      return rateLimit429(limitResult);
    }

    const orgSnapshot = await db.collection('organizations')
      .where('org_wl_email', '==', email)
      .limit(1)
      .get();

    if (orgSnapshot.empty) {
      // Don't reveal whether email exists
      return NextResponse.json(
        { success: true, message: 'Als dit e-mailadres bij een niet-geverifieerd account hoort, is er een nieuwe code verzonden.' }
      );
    }

    const orgDoc = orgSnapshot.docs[0];
    const orgData = orgDoc.data();

    if (orgData?.verified === true) {
      return NextResponse.json(
        { error: 'Dit account is al geverifieerd. U kunt inloggen.' },
        { status: 400 }
      );
    }

    const verificationCode = generateVerificationCode();
    const verificationTime = Date.now();

    await orgDoc.ref.update({
      verification_code: verificationCode,
      verification_time: verificationTime,
    });

    const registrationEmail = generateRegistrationEmail(
      email,
      (orgData?.org_naam as string) || '',
      (orgData?.org_code as string) || '',
      verificationCode
    );

    await addEmailToQueue({
      ...registrationEmail,
      org_nummer: orgData?.org_nummer as number,
    });

    console.log(`[RESEND_VERIFY] New code sent to ${email}, org ${orgData?.org_nummer}`);

    void logAuthEvent({
      endpoint: 'resend-verification',
      success: true,
      ip: getClientIp(request),
      userAgent: getUserAgent(request),
      identifier: email,
    });

    return NextResponse.json({
      success: true,
      message: 'Er is een nieuwe verificatiecode naar uw e-mailadres verzonden. De code is 15 minuten geldig.',
    });
  } catch (error) {
    console.error('[RESEND_VERIFY] Error:', error);
    void logAuthEvent({
      endpoint: 'resend-verification',
      success: false,
      ip: getClientIp(request),
      userAgent: getUserAgent(request),
    });
    return NextResponse.json(
      { error: 'Er is een fout opgetreden. Probeer het later opnieuw.' },
      { status: 500 }
    );
  }
}

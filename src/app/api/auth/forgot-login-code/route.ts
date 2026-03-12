import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { addEmailToQueue, generateForgotLoginCodeEmail } from '@/lib/emailQueue';
import { checkForgotLoginCodeLimit, getClientIp, getUserAgent, rateLimit429 } from '@/lib/rateLimit';
import { logAuthEvent } from '@/lib/authLog';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function formatDateDutch(isoString: string): string {
  const d = new Date(isoString);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * POST /api/auth/forgot-login-code
 * Request to send the login code to the given email. Only if no such email was sent in the last 7 days.
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

    const limitResult = await checkForgotLoginCodeLimit(request, email);
    if (!limitResult.allowed) {
      return rateLimit429(limitResult);
    }

    const orgSnapshot = await db.collection('organizations')
      .where('org_wl_email', '==', email)
      .limit(1)
      .get();

    if (orgSnapshot.empty) {
      return NextResponse.json({
        success: true,
        message: 'Als dit e-mailadres bij een account hoort, is de inlogcode naar dat adres verzonden.',
      });
    }

    const orgDoc = orgSnapshot.docs[0];
    const orgData = orgDoc.data();

    if (orgData?.verified !== true) {
      return NextResponse.json({
        success: true,
        message: 'Als dit e-mailadres bij een account hoort, is de inlogcode naar dat adres verzonden.',
      });
    }

    const lastSentAt = orgData?.last_inlogcode_vergeten_sent_at;
    if (lastSentAt) {
      const lastSentTime = typeof lastSentAt === 'string' ? new Date(lastSentAt).getTime() : lastSentAt;
      if (Date.now() - lastSentTime < SEVEN_DAYS_MS) {
        return NextResponse.json({
          already_sent: true,
          sent_at: formatDateDutch(typeof lastSentAt === 'string' ? lastSentAt : new Date(lastSentAt).toISOString()),
          message: `De laatste vergeten inlogcode is verstuurd op ${formatDateDutch(typeof lastSentAt === 'string' ? lastSentAt : new Date(lastSentAt).toISOString())}.`,
        });
      }
    }

    const loginCode = (orgData?.org_code as string) || '';
    const orgNaam = (orgData?.org_naam as string) || '';

    const forgotEmail = generateForgotLoginCodeEmail(email, orgNaam, loginCode);
    await addEmailToQueue({
      ...forgotEmail,
      org_nummer: orgData?.org_nummer as number,
    });

    const now = new Date().toISOString();
    await orgDoc.ref.update({
      last_inlogcode_vergeten_sent_at: now,
    });

    console.log(`[FORGOT_LOGIN_CODE] Login code sent to ${email}, org ${orgData?.org_nummer}`);

    void logAuthEvent({
      endpoint: 'forgot-login-code',
      success: true,
      ip: getClientIp(request),
      userAgent: getUserAgent(request),
      identifier: email,
    });

    return NextResponse.json({
      success: true,
      message: 'Als dit e-mailadres bij een account hoort, is de inlogcode naar dat adres verzonden. Controleer ook uw spammap.',
    });
  } catch (error) {
    console.error('[FORGOT_LOGIN_CODE] Error:', error);
    void logAuthEvent({
      endpoint: 'forgot-login-code',
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

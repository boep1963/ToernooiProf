import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  addEmailToQueue,
  buildDashboardContactEmailBody,
  getNotificationToEmail,
} from '@/lib/emailQueue';
import { cookies } from 'next/headers';
import { decodeSessionCookie, SESSION_COOKIE_NAME } from '@/lib/session';

// Helper to get authenticated org from session cookie
async function getAuthOrg(): Promise<{ orgNummer: number; orgName: string } | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!sessionCookie) return null;
  const session = decodeSessionCookie(sessionCookie.value);
  if (!session) return null;
  return { orgNummer: session.orgNummer, orgName: session.orgNaam || '' };
}

const VALID_PROGRAMMA = ['ToernooiProf'];
const VALID_ONDERWERP = ['vraag', 'klacht', 'suggestie'];
const ONDERWERP_LABELS: Record<string, string> = {
  vraag: 'Vraag',
  klacht: 'Klacht',
  suggestie: 'Suggestie',
};

// POST /api/contact - Submit a contact form
export async function POST(request: NextRequest) {
  const auth = await getAuthOrg();
  if (!auth) {
    return NextResponse.json({ error: 'Niet ingelogd. Log opnieuw in.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { programma, onderwerp, bericht } = body;

    if (!programma || !VALID_PROGRAMMA.includes(programma)) {
      return NextResponse.json({ error: 'Selecteer een geldig programma.' }, { status: 400 });
    }

    if (!onderwerp || !VALID_ONDERWERP.includes(onderwerp)) {
      return NextResponse.json({ error: 'Selecteer een geldig onderwerp.' }, { status: 400 });
    }

    if (!bericht) {
      return NextResponse.json({ error: 'Bericht is verplicht.' }, { status: 400 });
    }

    if (bericht.length > 1000) {
      return NextResponse.json({ error: 'Bericht mag maximaal 1000 tekens zijn.' }, { status: 400 });
    }

    if (bericht.trim().length === 0) {
      return NextResponse.json({ error: 'Bericht mag niet leeg zijn.' }, { status: 400 });
    }

    // Fetch organization details to get email, contact person, and login code
    const orgSnapshot = await db.collection('organizations')
      .where('org_nummer', '==', auth.orgNummer)
      .limit(1)
      .get();

    let orgEmail = '';
    let orgContactPersoon = '';
    let orgCode = '';
    let orgName = auth.orgName;
    if (!orgSnapshot.empty) {
      const orgData = orgSnapshot.docs[0].data();
      orgEmail = (orgData?.org_wl_email as string) || '';
      orgContactPersoon = (orgData?.org_wl_naam as string) || '';
      orgCode = (orgData?.org_code as string) || '';
      orgName = (orgData?.org_naam as string) || auth.orgName;
    }

    const now = new Date().toISOString();

    const contactData = {
      programma: programma,
      onderwerp: onderwerp,
      onderwerp_label: ONDERWERP_LABELS[onderwerp] || onderwerp,
      bericht: bericht.trim(),
      org_nummer: auth.orgNummer,
      org_naam: orgName,
      org_contactpersoon: orgContactPersoon,
      org_email: orgEmail,
      org_code: orgCode,
      tijd: now,
    };

    // Store in Firestore
    const docRef = await db.collection('contact_messages').add(contactData);

    const onderwerpLabel = ONDERWERP_LABELS[onderwerp] || onderwerp;

    try {
      await addEmailToQueue({
        to: getNotificationToEmail(),
        subject: `[ToernooiProf] Contact: ${onderwerpLabel} (${orgName || `org ${auth.orgNummer}`})`,
        body: buildDashboardContactEmailBody({
          appLabel: 'ToernooiProf',
          programmaLabel: programma,
          onderwerpLabel,
          bericht: bericht.trim(),
          contactMessageId: docRef.id,
          org_naam: orgName,
          org_nummer: auth.orgNummer,
          org_code: orgCode,
          org_contactpersoon: orgContactPersoon,
          org_email: orgEmail,
        }),
        type: 'notification',
        org_nummer: auth.orgNummer,
      });
    } catch (queueErr) {
      console.error('[CONTACT] Kon notificatie niet in email_queue zetten:', queueErr);
    }

    console.log(`[CONTACT] New contact message from org ${auth.orgNummer} (${orgName})`);
    console.log(`[CONTACT] Stored as document: ${docRef.id}`);

    return NextResponse.json({
      success: true,
      message: 'Uw bericht is succesvol verzonden.',
    }, { status: 201 });
  } catch (error) {
    console.error('[CONTACT] Error submitting contact form:', error);
    return NextResponse.json({ error: 'Fout bij verzenden bericht.' }, { status: 500 });
  }
}

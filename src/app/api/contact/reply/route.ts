import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { BCC_EMAILS } from '@/lib/emailQueue';
import { cookies } from 'next/headers';

// Helper to get authenticated org from session cookie
async function getAuthOrg(): Promise<{ orgNummer: number; orgName: string } | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('clubmatch-session');
  if (!sessionCookie) return null;
  try {
    const session = JSON.parse(sessionCookie.value);
    return { orgNummer: session.orgNummer, orgName: session.orgNaam || '' };
  } catch {
    return null;
  }
}

/**
 * POST /api/contact/reply
 * Send a reply to a contact message by adding it to the email queue.
 * The reply is sent to the org_email from the original contact message.
 */
export async function POST(request: NextRequest) {
  const auth = await getAuthOrg();
  if (!auth) {
    return NextResponse.json({ error: 'Niet ingelogd. Log opnieuw in.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { contactMessageId, replyMessage } = body;

    if (!contactMessageId || typeof contactMessageId !== 'string') {
      return NextResponse.json({ error: 'Contact bericht ID is verplicht.' }, { status: 400 });
    }

    if (!replyMessage || typeof replyMessage !== 'string' || replyMessage.trim().length === 0) {
      return NextResponse.json({ error: 'Antwoordbericht is verplicht.' }, { status: 400 });
    }

    if (replyMessage.length > 2000) {
      return NextResponse.json({ error: 'Antwoord mag maximaal 2000 tekens zijn.' }, { status: 400 });
    }

    // Fetch the original contact message
    const contactDoc = await db.collection('contact_messages').doc(contactMessageId).get();

    if (!contactDoc.exists) {
      return NextResponse.json({ error: 'Contact bericht niet gevonden.' }, { status: 404 });
    }

    const contactData = contactDoc.data();
    if (!contactData) {
      return NextResponse.json({ error: 'Contact bericht data niet beschikbaar.' }, { status: 404 });
    }

    const recipientEmail = contactData.org_email;
    if (!recipientEmail) {
      return NextResponse.json({ error: 'Geen e-mailadres beschikbaar voor deze afzender.' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const onderwerp = contactData.onderwerp_label || contactData.onderwerp || 'Contact';
    const programma = contactData.programma || 'ClubMatch';

    // Add reply to email queue
    const emailDoc = {
      to: recipientEmail,
      subject: `Re: ${programma} - ${onderwerp} (van ${contactData.org_naam || 'Onbekend'})`,
      body: `Beste ${contactData.org_contactpersoon || contactData.org_naam || 'gebruiker'},

Bedankt voor uw bericht via het contactformulier.

--- Uw oorspronkelijke bericht ---
Programma: ${programma}
Onderwerp: ${onderwerp}
Bericht: ${contactData.bericht || ''}
---

Ons antwoord:
${replyMessage.trim()}

Met vriendelijke groet,
Het ClubMatch Team`,
      type: 'notification',
      status: 'pending',
      created_at: now,
      org_nummer: contactData.org_nummer,
      reply_to_contact: contactMessageId,
      bcc: BCC_EMAILS,
    };

    const emailRef = await db.collection('email_queue').add(emailDoc);

    // Log reply to console
    console.log(`[CONTACT REPLY] Reply to contact message ${contactMessageId}`);
    console.log(`[CONTACT REPLY] To: ${recipientEmail}`);
    console.log(`[CONTACT REPLY] Subject: Re: ${programma} - ${onderwerp}`);
    console.log(`[CONTACT REPLY] Reply message: ${replyMessage.trim()}`);
    console.log(`[CONTACT REPLY] Email queued with ID: ${emailRef.id}`);

    // Update original contact message with reply info
    await db.collection('contact_messages').doc(contactMessageId).update({
      beantwoord: true,
      beantwoord_tijd: now,
      beantwoord_email_id: emailRef.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Antwoord is succesvol verzonden.',
      emailId: emailRef.id,
    }, { status: 201 });
  } catch (error) {
    console.error('[CONTACT REPLY] Error sending reply:', error);
    return NextResponse.json({ error: 'Fout bij verzenden antwoord.' }, { status: 500 });
  }
}

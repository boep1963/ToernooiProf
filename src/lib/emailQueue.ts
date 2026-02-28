/**
 * Email Queue Utility
 *
 * This module provides utilities for queueing emails to be sent by a Cloud Function.
 * Instead of sending emails directly (which requires SMTP credentials), we store
 * email details in a Firestore collection. A Cloud Function watches this collection
 * and sends the actual emails.
 */

import db from '@/lib/db';

/** BCC-adressen voor alle uitgaande mail (o.a. voor archief). */
export const BCC_EMAILS = 'hanseekels@gmail.com, p@de-boer.net';

export interface EmailQueueDocument {
  to: string;
  subject: string;
  body: string;
  type: 'registration' | 'verification' | 'notification' | 'other';
  status: 'pending' | 'sent' | 'failed';
  created_at: string;
  org_nummer?: number;
  error_message?: string;
  sent_at?: string;
  /** BCC voor alle uitgaande mail naar gebruikers. */
  bcc?: string;
}

/**
 * Add an email to the queue for sending by a Cloud Function
 *
 * @param email - Email queue document to add
 * @returns Promise with the created document ID
 */
export async function addEmailToQueue(email: Omit<EmailQueueDocument, 'status' | 'created_at'>): Promise<string> {
  const emailDoc: EmailQueueDocument = {
    ...email,
    bcc: BCC_EMAILS,
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  console.log(`[EMAIL_QUEUE] Adding ${email.type} email to queue for ${email.to}`);

  const docRef = await db.collection('email_queue').add(emailDoc);

  console.log(`[EMAIL_QUEUE] Email queued with ID: ${docRef.id}`);

  return docRef.id;
}

/**
 * Generate registration email content
 */
export function generateRegistrationEmail(
  recipientEmail: string,
  orgNaam: string,
  loginCode: string,
  verificationCode: string
): Omit<EmailQueueDocument, 'status' | 'created_at'> {
  return {
    to: recipientEmail,
    subject: 'Welkom bij ClubMatch - Verificatie vereist',
    body: `
Welkom bij ClubMatch!

Bedankt voor uw registratie voor organisatie "${orgNaam}".

Om uw account te activeren, moet u uw e-mailadres verifiëren met de volgende code:

Verificatiecode: ${verificationCode}

Deze code is 15 minuten geldig.

Na verificatie kunt u inloggen met uw inlogcode:
${loginCode}

Met vriendelijke groet,
Het ClubMatch Team
    `.trim(),
    type: 'registration',
  };
}

/**
 * Generate verification confirmation email content
 */
export function generateVerificationConfirmationEmail(
  recipientEmail: string,
  orgNaam: string,
  loginCode: string
): Omit<EmailQueueDocument, 'status' | 'created_at'> {
  return {
    to: recipientEmail,
    subject: 'ClubMatch - Account geverifieerd',
    body: `
Uw ClubMatch account is geverifieerd!

Organisatie: ${orgNaam}
Inlogcode: ${loginCode}

U kunt nu volledig gebruikmaken van ClubMatch.

Met vriendelijke groet,
Het ClubMatch Team
    `.trim(),
    type: 'verification',
  };
}

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

/** Eerste adres uit BCC; gebruikt als ontvanger voor notificaties (bijv. nieuwe issues). */
export function getNotificationToEmail(): string {
  return BCC_EMAILS.split(',')[0].trim();
}

export interface EmailQueueDocument {
  to: string;
  subject: string;
  body: string;
  type: 'registration' | 'verification' | 'notification' | 'new_issue' | 'issue_done' | 'issue_updated' | 'other';
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

  const docRef = await db.collection('email_queue').add(emailDoc as any);

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
    subject: 'Welkom bij ToernooiProf - Verificatie vereist',
    body: `
Welkom bij ToernooiProf!

Bedankt voor uw registratie voor organisatie "${orgNaam}".

Om uw account te activeren, moet u uw e-mailadres verifiëren met de volgende code:

Verificatiecode: ${verificationCode}

Deze code is 15 minuten geldig.

Na verificatie kunt u inloggen met uw inlogcode:
${loginCode}

Met vriendelijke groet,
Het ToernooiProf Team
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
    subject: 'ToernooiProf - Account geverifieerd',
    body: `
Uw ToernooiProf account is geverifieerd!

Organisatie: ${orgNaam}
Inlogcode: ${loginCode}

U kunt nu volledig gebruikmaken van ToernooiProf.

Met vriendelijke groet,
Het ToernooiProf Team
    `.trim(),
    type: 'verification',
  };
}

/**
 * Generate "inlogcode vergeten" email: send login code to the given email.
 */
export function generateForgotLoginCodeEmail(
  recipientEmail: string,
  orgNaam: string,
  loginCode: string
): Omit<EmailQueueDocument, 'status' | 'created_at'> {
  return {
    to: recipientEmail,
    subject: 'ToernooiProf - Uw inlogcode',
    body: `
U heeft uw inlogcode opgevraagd voor ToernooiProf.

Organisatie: ${orgNaam}

Uw inlogcode: ${loginCode}

U kunt met deze code inloggen op ToernooiProf.

Met vriendelijke groet,
Het ToernooiProf Team
    `.trim(),
    type: 'notification',
  };
}

/**
 * Generate "nieuw issue" notification email (bug or feature created in admin).
 */
export function generateNewIssueEmail(
  appName: string,
  title: string,
  issueType: 'bug' | 'feature',
  description?: string
): Omit<EmailQueueDocument, 'status' | 'created_at'> {
  const typeLabel = issueType === 'bug' ? 'bug' : 'feature';
  const now = new Date().toLocaleString('nl-NL');
  return {
    to: getNotificationToEmail(),
    subject: `[${appName}] Nieuw ${typeLabel}: ${title}`,
    body: `
Er is een nieuw issue aangemaakt in ${appName}.

Type: ${typeLabel === 'bug' ? 'Bug' : 'Feature'}
Titel: ${title}
Datum: ${now}
${description ? `\nOmschrijving:\n${description}\n` : ''}

Deze e-mail is automatisch gegenereerd door het admin-issues systeem.
    `.trim(),
    type: 'new_issue',
  };
}

/**
 * Generate "issue gereed" notification email (status changed to done).
 * BCC wordt door addEmailToQueue gezet (hanseekels@gmail.com, p@de-boer.net).
 */
export function generateIssueDoneEmail(
  appName: string,
  title: string,
  issueType: 'bug' | 'feature',
  completedAt: string,
  description?: string
): Omit<EmailQueueDocument, 'status' | 'created_at'> {
  const typeLabel = issueType === 'bug' ? 'Bug' : 'Feature';
  const completedDate = new Date(completedAt).toLocaleString('nl-NL');
  return {
    to: getNotificationToEmail(),
    subject: `[${appName}] Issue gereed: ${title}`,
    body: `
Een issue is als gereed gemarkeerd in ${appName}.

Type: ${typeLabel}
Titel: ${title}
Gereed op: ${completedDate}
${description ? `\nOmschrijving:\n${description}\n` : ''}

Deze e-mail is automatisch gegenereerd door het admin-issues systeem.
    `.trim(),
    type: 'issue_done',
  };
}

/**
 * Generate "issue bijgewerkt" notification email.
 * Gaat naar Hans en Pierre via BCC (addEmailToQueue zet BCC_EMAILS).
 */
export function generateIssueUpdatedEmail(
  appName: string,
  title: string,
  issueId: string,
  updatedAt: string
): Omit<EmailQueueDocument, 'status' | 'created_at'> {
  const updatedDate = new Date(updatedAt).toLocaleString('nl-NL');
  return {
    to: getNotificationToEmail(),
    subject: `[${appName}] Geüpdatet: ${title}. Wellicht actie nodig`,
    body: `
Een issue is bijgewerkt in ${appName}.

Titel: ${title}
Issue-ID: ${issueId}
Bijgewerkt op: ${updatedDate}

Wellicht actie nodig.

Deze e-mail is automatisch gegenereerd door het admin-issues systeem.
    `.trim(),
    type: 'issue_updated',
  };
}

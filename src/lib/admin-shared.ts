/**
 * Shared admin utilities — safe for client-side use.
 *
 * This module contains ONLY pure functions with no Node.js or server-side
 * dependencies so it can be imported from React components and hooks.
 */

/**
 * Configurable list of admin emails.
 * - Entries starting with '@' are treated as domain patterns (matched with .includes())
 * - Full email addresses are matched exactly (case-insensitive)
 */
export const ADMIN_EMAILS: string[] = [
  '@de-boer.net',
  'hanseekels@gmail.com',
];

/**
 * Check if an email address belongs to a super admin.
 * Super admins are users whose organization email (org_wl_email) matches
 * any entry in ADMIN_EMAILS — domain patterns use .includes(), full
 * email addresses use exact (case-insensitive) match.
 */
export function isSuperAdmin(email: string | null | undefined): boolean {
  if (!email || typeof email !== 'string') return false;
  const normalizedEmail = email.toLowerCase().trim();
  return ADMIN_EMAILS.some((entry) => {
    const normalizedEntry = entry.toLowerCase().trim();
    if (normalizedEntry.startsWith('@')) {
      // Domain pattern: check if the email contains this domain
      return normalizedEmail.includes(normalizedEntry);
    }
    // Full email address: exact match
    return normalizedEmail === normalizedEntry;
  });
}

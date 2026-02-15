'use client';

import { useAuth } from '@/context/AuthContext';
import { isSuperAdmin as checkSuperAdmin } from '@/lib/admin';

/**
 * React hook that checks if the currently logged-in user is a super admin.
 * Uses the org_wl_email from the authenticated organization data and checks
 * it against the ADMIN_EMAILS whitelist (domain patterns + exact emails).
 *
 * @returns {{ isSuperAdmin: boolean }} - true if the user's org email matches any admin entry
 */
export function useSuperAdmin(): { isSuperAdmin: boolean } {
  const { organization } = useAuth();
  const email = organization?.org_wl_email ?? null;
  return { isSuperAdmin: checkSuperAdmin(email) };
}

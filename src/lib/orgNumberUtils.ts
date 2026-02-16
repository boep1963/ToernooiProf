/**
 * Utility functions for org_nummer type safety in Firestore queries.
 *
 * PROBLEM: Firestore uses strict type comparison. If org_nummer is stored as a number
 * in some documents but queried as a string (or vice versa), you'll get 0 results.
 *
 * SOLUTION: Always normalize org_nummer to a number before querying.
 */

/**
 * Normalize org_nummer to a number for consistent Firestore queries.
 * Accepts number, string, or null/undefined and always returns a number.
 *
 * @param orgNummer - The organization number to normalize (can be string, number, null, undefined)
 * @returns A number representation of the org_nummer
 * @throws Error if the input cannot be converted to a valid number
 *
 * @example
 * normalizeOrgNummer(1000)      // => 1000
 * normalizeOrgNummer("1000")    // => 1000
 * normalizeOrgNummer("1205")    // => 1205
 */
export function normalizeOrgNummer(orgNummer: string | number | null | undefined): number {
  if (orgNummer === null || orgNummer === undefined) {
    throw new Error('[normalizeOrgNummer] org_nummer cannot be null or undefined');
  }

  if (typeof orgNummer === 'number') {
    if (!Number.isFinite(orgNummer) || orgNummer <= 0) {
      throw new Error(`[normalizeOrgNummer] Invalid org_nummer: ${orgNummer}`);
    }
    return orgNummer;
  }

  if (typeof orgNummer === 'string') {
    const parsed = parseInt(orgNummer, 10);
    if (!Number.isFinite(parsed) || parsed <= 0 || parsed.toString() !== orgNummer.trim()) {
      throw new Error(`[normalizeOrgNummer] Invalid org_nummer string: "${orgNummer}"`);
    }
    return parsed;
  }

  throw new Error(`[normalizeOrgNummer] Unexpected type for org_nummer: ${typeof orgNummer}`);
}

/**
 * Validates that org_nummer is stored consistently in Firestore.
 * Used for debugging and migration purposes.
 *
 * @param orgNummer - The value stored in a Firestore document
 * @returns true if it's a valid number, false otherwise
 */
export function isValidOrgNummerType(orgNummer: unknown): boolean {
  return typeof orgNummer === 'number' && Number.isFinite(orgNummer) && orgNummer > 0;
}

/**
 * Log a warning if a query returns 0 results for a collection that should have data.
 * This helps detect type mismatches in production.
 *
 * @param collection - The collection name being queried
 * @param orgNummer - The org_nummer used in the query
 * @param resultCount - The number of results returned
 */
export function logQueryResult(
  collection: string,
  orgNummer: number,
  resultCount: number
): void {
  if (resultCount === 0) {
    console.warn(
      `[orgNumberUtils] Query returned 0 results for collection "${collection}" with org_nummer=${orgNummer}. ` +
      `This might indicate a type mismatch (number vs string) in Firestore.`
    );
  }
}

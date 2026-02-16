/**
 * Firestore Query Utilities
 *
 * Firestore uses strict type comparison. Data imported from SQL databases may
 * store numeric fields as strings (e.g., "1000" instead of 1000), causing
 * queries with number types to return 0 results.
 *
 * These utilities help query Firestore with type-tolerance to handle both
 * string and number variants of numeric fields.
 */

import { CollectionReference, Query, QuerySnapshot } from 'firebase-admin/firestore';

/**
 * Execute a query that tolerates both string and number types for specified fields.
 *
 * This function runs multiple queries (one for each type variant) and merges
 * the results, deduplicating by document ID.
 *
 * @param baseQuery - The base Firestore query/collection
 * @param filters - Array of filter objects with field, operator, and value
 * @returns Merged query snapshot
 *
 * @example
 * ```ts
 * const results = await dualTypeQuery(
 *   db.collection('results'),
 *   [
 *     { field: 'org_nummer', op: '==', value: 1000 },
 *     { field: 'comp_nr', op: '==', value: 4 },
 *     { field: 'gespeeld', op: '==', value: 1 }
 *   ]
 * );
 * ```
 */
export async function dualTypeQuery(
  baseQuery: CollectionReference | Query,
  filters: Array<{ field: string; op: FirebaseFirestore.WhereFilterOp; value: any }>
): Promise<{ docs: FirebaseFirestore.DocumentSnapshot[]; size: number; empty: boolean }> {
  // For each numeric filter value, we need to query both as number and as string
  const numericFilters = filters.filter(f =>
    typeof f.value === 'number' && f.op === '=='
  );

  // If no numeric filters, just apply all filters normally
  if (numericFilters.length === 0) {
    let query: any = baseQuery;
    for (const filter of filters) {
      query = query.where(filter.field, filter.op, filter.value);
    }
    return await query.get();
  }

  // Generate all combinations: for each numeric filter, try both number and string
  // This creates 2^n queries where n = number of numeric filters
  const combinations = Math.pow(2, numericFilters.length);
  const allDocs = new Map<string, FirebaseFirestore.DocumentSnapshot>();

  for (let i = 0; i < combinations; i++) {
    let query: any = baseQuery;

    // Apply all filters
    for (const filter of filters) {
      const numericIndex = numericFilters.findIndex(nf => nf.field === filter.field);

      if (numericIndex >= 0) {
        // This is a numeric filter - use number or string based on bit pattern
        const useString = (i & (1 << numericIndex)) !== 0;
        const value = useString ? String(filter.value) : filter.value;
        query = query.where(filter.field, filter.op, value);
      } else {
        // Non-numeric filter - apply as-is
        query = query.where(filter.field, filter.op, filter.value);
      }
    }

    // Execute query
    const snapshot: QuerySnapshot = await query.get();

    // Add docs to map (deduplicating by doc.id)
    snapshot.forEach(doc => {
      if (!allDocs.has(doc.id)) {
        allDocs.set(doc.id, doc);
      }
    });
  }

  // Return a snapshot-like object
  const docs = Array.from(allDocs.values());
  return {
    docs,
    size: docs.length,
    empty: docs.length === 0
  };
}

/**
 * Simpler version that only handles org_nummer and comp_nr fields.
 * Use this for most common cases.
 *
 * @param baseQuery - The base Firestore query/collection
 * @param orgNummer - Organization number (will query both as number and string)
 * @param compNr - Competition number (will query both as number and string)
 * @param additionalFilters - Additional filters to apply
 * @returns Merged query snapshot
 */
export async function queryWithOrgComp(
  baseQuery: CollectionReference | Query,
  orgNummer: number,
  compNr: number | null = null,
  additionalFilters: Array<{ field: string; op: FirebaseFirestore.WhereFilterOp; value: any }> = []
): Promise<{ docs: FirebaseFirestore.DocumentSnapshot[]; size: number; empty: boolean }> {
  const filters: Array<{ field: string; op: FirebaseFirestore.WhereFilterOp; value: any }> = [
    { field: 'org_nummer', op: '==', value: orgNummer }
  ];

  if (compNr !== null) {
    filters.push({ field: 'comp_nr', op: '==', value: compNr });
  }

  filters.push(...additionalFilters);

  return dualTypeQuery(baseQuery, filters);
}

/**
 * Normalize a value to handle both string and number types in filters.
 * Returns an array of values to try in queries.
 *
 * @param value - The value to normalize
 * @returns Array of values to try (e.g., [1000, "1000"])
 */
export function normalizeQueryValue(value: any): any[] {
  if (typeof value === 'number') {
    return [value, String(value)];
  }
  if (typeof value === 'string' && !isNaN(Number(value))) {
    return [Number(value), value];
  }
  return [value];
}

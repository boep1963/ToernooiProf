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
 * @deprecated After Feature #319, this function is no longer needed.
 * All numeric fields have been normalized to number type via migration.
 * Use standard Firestore queries instead.
 *
 * Execute a query that tolerates both string and number types for specified fields.
 *
 * This function runs multiple queries (one for each type variant) and merges
 * the results, deduplicating by document ID.
 *
 * PERFORMANCE WARNING: This generates 2^n queries where n = number of numeric filters.
 * Example: 3 numeric filters = 8 queries instead of 1.
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
  // Identify filters that need dual-type treatment:
  // 1. '==' operator with a numeric value
  // 2. 'in' operator with an array containing at least one number
  const dualTypeFilters = filters.filter(f =>
    (typeof f.value === 'number' && f.op === '==') ||
    (f.op === 'in' && Array.isArray(f.value) && f.value.some((v: any) => typeof v === 'number'))
  );

  // If no dual-type filters, just apply all filters normally
  if (dualTypeFilters.length === 0) {
    let query: any = baseQuery;
    for (const filter of filters) {
      query = query.where(filter.field, filter.op, filter.value);
    }
    return await query.get();
  }

  // Generate all combinations: for each dual-type filter, try both number and string variants
  // This creates 2^n queries where n = number of dual-type filters
  const combinations = Math.pow(2, dualTypeFilters.length);
  const allDocs = new Map<string, FirebaseFirestore.DocumentSnapshot>();

  for (let i = 0; i < combinations; i++) {
    let query: any = baseQuery;

    // Apply all filters
    for (const filter of filters) {
      const dualIndex = dualTypeFilters.findIndex(nf => nf.field === filter.field && nf.op === filter.op);

      if (dualIndex >= 0) {
        const useString = (i & (1 << dualIndex)) !== 0;

        if (filter.op === 'in' && Array.isArray(filter.value)) {
          // For 'in' operator: convert entire array to strings or keep as numbers
          const value = useString
            ? filter.value.map((v: any) => typeof v === 'number' ? String(v) : v)
            : filter.value;
          query = query.where(filter.field, filter.op, value);
        } else {
          // For '==' operator: convert single value
          const value = useString ? String(filter.value) : filter.value;
          query = query.where(filter.field, filter.op, value);
        }
      } else {
        // Non-dual-type filter - apply as-is
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
 * NOTE: After Feature #319 migration, this function uses standard Firestore queries
 * instead of dualTypeQuery since all numeric fields are now normalized to number type.
 *
 * @param baseQuery - The base Firestore query/collection
 * @param orgNummer - Organization number
 * @param compNr - Competition number
 * @param additionalFilters - Additional filters to apply
 * @param orgField - Custom field name for organization (default: 'org_nummer')
 * @param compField - Custom field name for competition (default: 'comp_nr')
 * @returns Query snapshot
 */
export async function queryWithOrgComp(
  baseQuery: CollectionReference | Query,
  orgNummer: number,
  compNr: number | null = null,
  additionalFilters: Array<{ field: string; op: FirebaseFirestore.WhereFilterOp; value: any }> = [],
  orgField: string = 'org_nummer',
  compField: string = 'comp_nr'
): Promise<{ docs: FirebaseFirestore.DocumentSnapshot[]; size: number; empty: boolean }> {
  // Build standard Firestore query (no dual-type handling needed after migration)
  let query: any = baseQuery;

  // Apply org filter
  query = query.where(orgField, '==', orgNummer);

  // Apply comp filter if provided
  if (compNr !== null) {
    query = query.where(compField, '==', compNr);
  }

  // Apply additional filters
  for (const filter of additionalFilters) {
    query = query.where(filter.field, filter.op, filter.value);
  }

  // Execute single query and return
  const snapshot = await query.get();
  return {
    docs: snapshot.docs,
    size: snapshot.size,
    empty: snapshot.empty
  };
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

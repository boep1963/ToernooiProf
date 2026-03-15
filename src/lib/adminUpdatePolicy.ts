const IMMUTABLE_FIELDS = new Set([
  'org_nummer',
  'gebruiker_nr',
  't_nummer',
  'comp_nr',
  'sp_nummer',
  'spa_nummer',
  'spc_nummer',
  'uitslag_id',
  'created_at',
  'date_aangemaakt',
]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function sanitizeAdminDocumentUpdate(
  currentDoc: Record<string, unknown>,
  proposed: unknown
): { ok: true; data: Record<string, unknown> } | { ok: false; error: string } {
  if (!isPlainObject(proposed)) {
    return { ok: false, error: 'Ongeldige data in verzoek.' };
  }

  const cleanUpdate: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(proposed)) {
    if (IMMUTABLE_FIELDS.has(key)) continue;
    if (!(key in currentDoc)) continue; // Prevent accidental mass-assignment of new fields.
    if (typeof value === 'undefined') continue;
    cleanUpdate[key] = value;
  }

  if (Object.keys(cleanUpdate).length === 0) {
    return { ok: false, error: 'Geen geldige velden om bij te werken.' };
  }

  return { ok: true, data: cleanUpdate };
}


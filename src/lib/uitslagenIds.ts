export function buildUitslagDocId(orgNummer: number, compNumber: number, uitslagId: number): string {
  return `${orgNummer}_${compNumber}_${uitslagId}`;
}

export function buildLegacyUitslagDocId(uitslagId: number): string {
  return String(uitslagId);
}


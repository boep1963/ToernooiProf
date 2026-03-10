const STORAGE_KEY_PREFIX = 'toernooiprof-last-toernooi';

function key(orgNummer: number): string {
  return `${STORAGE_KEY_PREFIX}-${orgNummer}`;
}

/** Sla het laatst geopende toernooi (comp_nr) op voor deze organisatie. */
export function setLastOpenedTournament(orgNummer: number, compNr: number): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key(orgNummer), String(compNr));
  } catch {
    // ignore
  }
}

/** Haal het comp_nr van het laatst geopende toernooi op (of null). */
export function getLastOpenedTournament(orgNummer: number): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key(orgNummer));
    if (raw == null) return null;
    const n = parseInt(raw, 10);
    return Number.isNaN(n) ? null : n;
  } catch {
    return null;
  }
}

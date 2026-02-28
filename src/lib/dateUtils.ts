/**
 * Date utilities for ToernooiProf
 *
 * Dates in Firestore (imported from legacy PHP/MariaDB) are stored as DD-MM-YYYY strings.
 * JavaScript's Date constructor cannot parse DD-MM-YYYY, so this module provides
 * correct parsing and formatting utilities.
 *
 * Supported input formats:
 * - DD-MM-YYYY (legacy/Firestore format, e.g., "15-02-2026")
 * - YYYY-MM-DD (HTML date input / ISO date format, e.g., "2026-02-15")
 * - ISO datetime (e.g., "2026-02-15T14:30:00.000Z")
 */

/**
 * Parse a Dutch DD-MM-YYYY date string into a JavaScript Date object.
 * Also handles YYYY-MM-DD and ISO datetime strings.
 * Returns null if the input cannot be parsed.
 */
export function parseDutchDate(dateStr: string): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;

  const trimmed = dateStr.trim();

  // Try DD-MM-YYYY format (legacy Firestore format)
  const ddmmyyyyMatch = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (ddmmyyyyMatch) {
    const day = parseInt(ddmmyyyyMatch[1], 10);
    const month = parseInt(ddmmyyyyMatch[2], 10);
    const year = parseInt(ddmmyyyyMatch[3], 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return new Date(year, month - 1, day);
    }
  }

  // Try YYYY-MM-DD format (HTML date input format)
  const yyyymmddMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (yyyymmddMatch) {
    const year = parseInt(yyyymmddMatch[1], 10);
    const month = parseInt(yyyymmddMatch[2], 10);
    const day = parseInt(yyyymmddMatch[3], 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return new Date(year, month - 1, day);
    }
  }

  // Try ISO datetime format (e.g., "2026-02-15T14:30:00.000Z")
  if (trimmed.includes('T') || trimmed.length > 10) {
    const date = new Date(trimmed);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
}

/**
 * Format a date string as DD-MM-YYYY using nl-NL locale.
 * Handles DD-MM-YYYY, YYYY-MM-DD, and ISO datetime inputs.
 * Returns the raw string if it cannot be parsed.
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '-';

  const date = parseDutchDate(dateStr);
  if (!date) return dateStr;

  return date.toLocaleDateString('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Format a date string as DD-MM-YYYY HH:MM using nl-NL locale.
 * Handles DD-MM-YYYY, YYYY-MM-DD, and ISO datetime inputs.
 * Returns the raw string if it cannot be parsed.
 */
export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '-';

  const date = parseDutchDate(dateStr);
  if (!date) return dateStr;

  return date.toLocaleDateString('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Convert a DD-MM-YYYY string to YYYY-MM-DD for HTML date inputs.
 * If the input is already YYYY-MM-DD, returns it as-is.
 * Returns empty string if input cannot be parsed.
 */
export function toInputDate(dateStr: string): string {
  if (!dateStr) return '';

  const trimmed = dateStr.trim();

  // Already in YYYY-MM-DD format
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(trimmed)) {
    return trimmed;
  }

  // DD-MM-YYYY to YYYY-MM-DD
  const match = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (match) {
    const day = match[1].padStart(2, '0');
    const month = match[2].padStart(2, '0');
    const year = match[3];
    return `${year}-${month}-${day}`;
  }

  // ISO datetime - extract date part
  if (trimmed.includes('T')) {
    const isoDate = trimmed.split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
      return isoDate;
    }
  }

  return '';
}

/**
 * Convert a YYYY-MM-DD string (from HTML date input) back to DD-MM-YYYY for Firestore storage.
 * If the input is already DD-MM-YYYY, returns it as-is.
 * Returns the raw string if it cannot be converted.
 */
export function fromInputDate(dateStr: string): string {
  if (!dateStr) return '';

  const trimmed = dateStr.trim();

  // Already in DD-MM-YYYY format
  if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(trimmed)) {
    return trimmed;
  }

  // YYYY-MM-DD to DD-MM-YYYY
  const match = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) {
    const year = match[1];
    const month = match[2].padStart(2, '0');
    const day = match[3].padStart(2, '0');
    return `${day}-${month}-${year}`;
  }

  return dateStr;
}

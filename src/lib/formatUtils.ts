/**
 * Format utilities for consistent number formatting across the application
 */

/**
 * Format a decimal number to exactly 3 decimal places (truncated, not rounded)
 * @param value - The number to format
 * @returns Formatted string with exactly 3 decimal places
 *
 * Examples:
 * - 3.1253 -> "3.125"
 * - 3.1258 -> "3.125"
 * - 3 -> "3.000"
 * - 0.2 -> "0.200"
 */
export function formatDecimal(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.000';
  }

  // Truncate to 3 decimals (not round)
  const truncated = Math.floor(value * 1000) / 1000;

  // Format with exactly 3 decimal places
  return truncated.toFixed(3);
}

/**
 * Format a percentage to exactly 3 decimal places (truncated, not rounded)
 * Same as formatDecimal but semantically named for percentages
 * @param value - The percentage value to format
 * @returns Formatted string with exactly 3 decimal places
 */
export function formatPercentage(value: number | null | undefined): string {
  return formatDecimal(value);
}

/**
 * Format a moyenne value to exactly 3 decimal places (truncated, not rounded)
 * Same as formatDecimal but semantically named for moyenne values
 * @param value - The moyenne value to format
 * @returns Formatted string with exactly 3 decimal places
 */
export function formatMoyenne(value: number | null | undefined): string {
  return formatDecimal(value);
}

export function parseStrictPositiveInt(value: unknown): number | null {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

export function parseEnumNumber<T extends readonly number[]>(
  value: unknown,
  allowed: T
): T[number] | null {
  const parsed = Number(value);
  if (!allowed.includes(parsed as T[number])) return null;
  return parsed as T[number];
}

export function parseNumberArray(value: unknown, maxLength = 200): number[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > maxLength) {
    return null;
  }
  const parsed = value.map((v) => Number(v));
  if (parsed.some((v) => !Number.isFinite(v) || v <= 0)) return null;
  return parsed;
}

export function parseBoolean(value: unknown): boolean {
  return value === true;
}


import crypto from 'crypto';

export const SESSION_COOKIE_NAME = 'toernooiprof-session';
const SESSION_COOKIE_VERSION = 'v1';

export type SessionData = {
  orgNummer: number;
  orgNaam?: string;
  loginTime?: string;
  verified?: boolean;
};

function toBase64Url(input: string): string {
  return Buffer.from(input, 'utf8').toString('base64url');
}

function fromBase64Url(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function getSessionSecret(): string | null {
  const secret = process.env.SESSION_SECRET?.trim();
  return secret && secret.length > 0 ? secret : null;
}

function sign(payloadBase64: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payloadBase64).digest('base64url');
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parsePayload(payload: unknown): SessionData | null {
  if (!isObject(payload)) return null;
  const orgNummer = Number(payload.orgNummer);
  if (!Number.isFinite(orgNummer) || orgNummer <= 0) return null;
  return {
    orgNummer,
    orgNaam: typeof payload.orgNaam === 'string' ? payload.orgNaam : undefined,
    loginTime: typeof payload.loginTime === 'string' ? payload.loginTime : undefined,
    verified: payload.verified === true,
  };
}

function isLegacyUnsignedAllowed(): boolean {
  return process.env.ALLOW_LEGACY_UNSIGNED_SESSION === 'true' || process.env.NODE_ENV !== 'production';
}

export function encodeSessionCookie(session: SessionData): string {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error('SESSION_SECRET ontbreekt. Signed sessiecookies zijn verplicht.');
  }
  const payloadJson = JSON.stringify(session);
  const payloadBase64 = toBase64Url(payloadJson);
  const signature = sign(payloadBase64, secret);
  return `${SESSION_COOKIE_VERSION}.${payloadBase64}.${signature}`;
}

export function decodeSessionCookie(rawCookieValue: string): SessionData | null {
  if (!rawCookieValue || typeof rawCookieValue !== 'string') return null;

  if (rawCookieValue.startsWith(`${SESSION_COOKIE_VERSION}.`)) {
    const secret = getSessionSecret();
    if (!secret) return null;

    const parts = rawCookieValue.split('.');
    if (parts.length !== 3) return null;
    const [, payloadBase64, receivedSignature] = parts;
    const expectedSignature = sign(payloadBase64, secret);
    const validSig =
      receivedSignature.length === expectedSignature.length &&
      crypto.timingSafeEqual(Buffer.from(receivedSignature), Buffer.from(expectedSignature));
    if (!validSig) return null;

    try {
      const payloadJson = fromBase64Url(payloadBase64);
      const payload = JSON.parse(payloadJson);
      return parsePayload(payload);
    } catch {
      return null;
    }
  }

  if (!isLegacyUnsignedAllowed()) return null;
  try {
    const payload = JSON.parse(rawCookieValue);
    return parsePayload(payload);
  } catch {
    return null;
  }
}

export function buildSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 12,
    path: '/',
  };
}

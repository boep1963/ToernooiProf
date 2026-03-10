import { createHmac } from 'crypto';

const API_SECRET = 'bC!2026#SpSft@BiljartClub';
const MAX_AGE_SECONDS = 300; // 5 minuten

/**
 * Valideert een HMAC-SHA256 token van de landing page.
 * Token formaat: base64(timestamp:hmac)
 *
 * Controleert:
 * 1. Geldig base64 met juist formaat
 * 2. HMAC klopt (zelfde gedeeld geheim)
 * 3. Tijdstempel is niet ouder dan 5 minuten
 */
export function validateApiToken(token: string | null): boolean {
  if (!token) return false;

  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const separatorIndex = decoded.indexOf(':');
    if (separatorIndex === -1) return false;

    const timestamp = decoded.substring(0, separatorIndex);
    const receivedHmac = decoded.substring(separatorIndex + 1);

    // Controleer tijdstempel (niet ouder dan MAX_AGE_SECONDS)
    const tokenAge = Math.floor(Date.now() / 1000) - parseInt(timestamp, 10);
    if (isNaN(tokenAge) || tokenAge < 0 || tokenAge > MAX_AGE_SECONDS) return false;

    // Bereken verwachte HMAC
    const expectedHmac = createHmac('sha256', API_SECRET)
      .update(timestamp)
      .digest('hex');

    // Timing-safe vergelijking
    if (receivedHmac.length !== expectedHmac.length) return false;
    let mismatch = 0;
    for (let i = 0; i < expectedHmac.length; i++) {
      mismatch |= receivedHmac.charCodeAt(i) ^ expectedHmac.charCodeAt(i);
    }
    return mismatch === 0;
  } catch {
    return false;
  }
}

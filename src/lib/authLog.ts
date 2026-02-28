/**
 * Privacy-aware auth event logging for Cloud Logging.
 * IP and identifier are hashed (SHA-256, truncated) so they are not stored in plaintext.
 */

import crypto from 'crypto';

const LOG_NAME = 'toernoiprof-auth';
const HASH_TRUNCATE = 16;

function hash(value: string): string {
  if (!value || value === 'unknown') return '';
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, HASH_TRUNCATE);
}

export type AuthLogPayload = {
  endpoint: string;
  success: boolean;
  ip_hash?: string;
  user_agent?: string;
  identifier_hash?: string;
  timestamp: string;
};

function buildPayload(params: {
  endpoint: string;
  success: boolean;
  ip?: string;
  userAgent?: string;
  identifier?: string;
}): AuthLogPayload {
  const payload: AuthLogPayload = {
    endpoint: params.endpoint,
    success: params.success,
    timestamp: new Date().toISOString(),
  };
  if (params.ip) payload.ip_hash = hash(params.ip);
  if (params.userAgent) payload.user_agent = params.userAgent.length > 200 ? params.userAgent.slice(0, 200) : params.userAgent;
  if (params.identifier) payload.identifier_hash = hash(params.identifier);
  return payload;
}

let loggingClient: import('@google-cloud/logging').Logging | null = null;

function getLoggingClient(): typeof loggingClient {
  if (loggingClient !== null) return loggingClient;
  try {
    const { Logging } = require('@google-cloud/logging');
    loggingClient = new Logging();
    return loggingClient;
  } catch {
    loggingClient = null;
    return null;
  }
}

/**
 * Log an auth event (login, register, verify, logout) to Cloud Logging.
 * When Cloud Logging is not configured, writes structured JSON to console for local/dev.
 */
export async function logAuthEvent(params: {
  endpoint: string;
  success: boolean;
  ip?: string;
  userAgent?: string;
  identifier?: string;
}): Promise<void> {
  const payload = buildPayload(params);
  const client = getLoggingClient();

  if (client) {
    try {
      const log = client.log(LOG_NAME);
      const metadata = {
        severity: params.success ? 'INFO' : 'WARNING',
        resource: { type: 'global' },
      };
      const entry = log.entry(metadata, payload);
      await log.write(entry);
    } catch (err) {
      console.error('[authLog] Cloud Logging write failed:', err);
      console.log(JSON.stringify({ ...payload, _fallback: true }));
    }
  } else {
    console.log(JSON.stringify({ ...payload, _source: 'authLog' }));
  }
}

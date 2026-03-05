import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

function parseServiceAccountKey(raw: string): Record<string, unknown> {
  // The env var from .env.local contains literal \n sequences (backslash + n).
  // These are valid JSON escape sequences, so JSON.parse should handle them.
  // However, depending on how dotenv processes the value, we may need to handle
  // different formats. Try direct parse first, then fallback approaches.

  // Attempt 1: Direct parse (works when \n is literal in the JSON string)
  return JSON.parse(raw);
}

let _adminApp: App | undefined;

export function getAdminApp(): App {
  if (_adminApp) {
    return _adminApp;
  }

  if (getApps().length > 0) {
    _adminApp = getApps()[0];
    return _adminApp;
  }

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccount) {
    try {
      const creds = parseServiceAccountKey(serviceAccount);
      _adminApp = initializeApp({
        credential: cert(creds as Parameters<typeof cert>[0]),
      });
    } catch (error) {
      console.warn('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY, falling back to default credentials:', error);
      _adminApp = initializeApp();
    }
  } else {
    // Fallback: try to use default credentials (e.g., in Cloud environments)
    _adminApp = initializeApp();
  }
  
  return _adminApp;
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

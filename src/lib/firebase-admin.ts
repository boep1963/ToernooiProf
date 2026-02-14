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

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccount) {
    const creds = parseServiceAccountKey(serviceAccount);
    return initializeApp({
      credential: cert(creds as Parameters<typeof cert>[0]),
    });
  }

  // Fallback: try to use default credentials (e.g., in Cloud environments)
  return initializeApp();
}

const adminApp = getAdminApp();
const adminDb = getFirestore(adminApp);
const adminAuth = getAuth(adminApp);

export { adminApp, adminDb, adminAuth };

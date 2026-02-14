import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

// Load environment manually
const envContent = readFileSync('.env.local', 'utf8');
const serviceAccountMatch = envContent.match(/FIREBASE_SERVICE_ACCOUNT_KEY=(.+)/s);
if (!serviceAccountMatch) throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY not found');
const jsonStr = serviceAccountMatch[1].split('\n')[0].trim();
const serviceAccount = JSON.parse(jsonStr);

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function fixOrgField() {
  const orgNr = 9999;

  // Find and update organization
  const snapshot = await db.collection('ClubMatch/data/organizations')
    .where('org_nummer', '==', orgNr)
    .get();

  if (snapshot.empty) {
    console.log('Organization not found');
    process.exit(1);
  }

  const doc = snapshot.docs[0];
  await doc.ref.update({
    org_code: '9999_TEST123'
  });

  console.log('Updated organization with org_code field');
  process.exit(0);
}

fixOrgField().catch(console.error);

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
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

async function createTestOrg() {
  const orgNr = 9999;
  const loginCode = `9999_TEST123`;

  // Check if organization already exists
  const existingOrgs = await db.collection('ClubMatch/data/organizations')
    .where('org_nummer', '==', orgNr)
    .get();

  if (!existingOrgs.empty) {
    console.log('Organization 9999 already exists');
    console.log('Login code: 9999_TEST123');
    process.exit(0);
  }

  // Create organization
  await db.collection('ClubMatch/data/organizations').add({
    org_nummer: orgNr,
    org_naam: 'Test Org Session 25',
    org_contact: 'Session 25 Tester',
    org_email: 'session25@test.nl',
    org_code: loginCode,
    aantal_tafels: 4,
    org_actief: true,
    created_at: FieldValue.serverTimestamp(),
    last_login: null,
    nieuwsbrief: false
  });

  console.log('Created organization:', orgNr);
  console.log('Login code:', loginCode);

  process.exit(0);
}

createTestOrg().catch(console.error);

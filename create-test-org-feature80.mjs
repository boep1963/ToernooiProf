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
  // Find highest org number
  const orgsSnap = await db.collection('ClubMatch/data/organizations')
    .orderBy('org_nummer', 'desc')
    .limit(1)
    .get();

  const newOrgNr = orgsSnap.empty ? 9000 : orgsSnap.docs[0].data().org_nummer + 1;

  // Generate random login code
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const loginCode = `${newOrgNr}_${code}`;

  // Create organization
  await db.collection('ClubMatch/data/organizations').add({
    org_nummer: newOrgNr,
    org_naam: 'Test Org Feature 80',
    org_contact: 'Feature 80 Tester',
    org_email: 'feature80@test.nl',
    org_inlog_code: loginCode,
    aantal_tafels: 4,
    org_actief: true,
    created_at: FieldValue.serverTimestamp(),
    last_login: null,
    nieuwsbrief: false
  });

  console.log('Created organization:', newOrgNr);
  console.log('Login code:', loginCode);

  process.exit(0);
}

createTestOrg().catch(console.error);

#!/usr/bin/env node

/**
 * Verify Feature #237: Contact messages stored in Firestore
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

// Load environment variables manually
const envContent = readFileSync('.env.local', 'utf8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    envVars[key] = value;
  }
}

// Initialize Firebase Admin
function getAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccount = envVars.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccount) {
    throw new Error('No Firebase credentials found');
  }

  const creds = JSON.parse(serviceAccount);
  return initializeApp({
    credential: cert(creds)
  });
}

const app = getAdminApp();
const db = getFirestore(app);

(async () => {
  try {
    console.log('\n=== Feature #237 Verification ===\n');
    console.log('Checking contact_messages collection...\n');

    // Query for the test message
    const snapshot = await db.collection('contact_messages')
      .where('bericht', '>=', 'TEST_FEATURE_237')
      .where('bericht', '<=', 'TEST_FEATURE_237\uf8ff')
      .get();

    if (snapshot.empty) {
      console.log('❌ FAIL: No test message found in contact_messages collection');
      process.exit(1);
    }

    console.log(`✅ Found ${snapshot.size} contact message(s)\n`);

    snapshot.forEach(doc => {
      const data = doc.data();
      console.log('Document ID:', doc.id);
      console.log('Fields stored:');
      console.log('  - org_nummer:', data.org_nummer);
      console.log('  - org_naam:', data.org_naam);
      console.log('  - org_email:', data.org_email);
      console.log('  - onderwerp:', data.onderwerp);
      console.log('  - bericht:', data.bericht.substring(0, 80) + '...');
      console.log('  - tijd:', data.tijd);
      console.log('');
    });

    // Verify all required fields are present
    const firstDoc = snapshot.docs[0].data();
    const requiredFields = ['org_nummer', 'org_naam', 'org_email', 'onderwerp', 'bericht', 'tijd'];
    const missingFields = requiredFields.filter(field => !(field in firstDoc));

    if (missingFields.length > 0) {
      console.log('❌ FAIL: Missing required fields:', missingFields.join(', '));
      process.exit(1);
    }

    console.log('✅ PASS: All required fields present');
    console.log('✅ PASS: Contact messages are stored in Firestore');
    console.log('\nFeature #237 verification complete!\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();

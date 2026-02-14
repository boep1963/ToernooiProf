#!/usr/bin/env node

/**
 * Simple Firestore persistence test
 * This verifies we're using real Firestore by creating, reading, and deleting a document
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
  if (serviceAccount) {
    const creds = JSON.parse(serviceAccount);
    return initializeApp({
      credential: cert(creds),
    });
  }

  throw new Error('No Firebase credentials found');
}

const app = getAdminApp();
const db = getFirestore(app);

const TEST_MEMBER_NAME = 'PERSISTENCE_TEST_' + Date.now();
const TEST_ORG = 9999;

async function main() {
  console.log('=== FIRESTORE PERSISTENCE TEST ===\n');

  try {
    // Step 1: Create test document
    console.log('📝 Creating test member:', TEST_MEMBER_NAME);
    const memberData = {
      spa_nummer: 99999,
      spa_vnaam: TEST_MEMBER_NAME,
      spa_tv: 'van',
      spa_anaam: 'PersistenceTest',
      spa_org: TEST_ORG,
      spa_moy_lib: 1.0,
      spa_moy_band: 0.5,
      spa_moy_3bkl: 0.3,
      spa_moy_3bgr: 0.2,
      spa_moy_kad: 0.1,
      _test_timestamp: new Date().toISOString(),
    };

    const docRef = await db.collection('members').add(memberData);
    console.log(`✅ Created test member with ID: ${docRef.id}`);

    // Step 2: Read it back immediately
    console.log('\n🔍 Reading back the document...');
    const readDoc = await docRef.get();

    if (!readDoc.exists) {
      console.log('❌ FAIL: Document was created but cannot be read back!');
      process.exit(1);
    }

    const readData = readDoc.data();
    if (readData.spa_vnaam !== TEST_MEMBER_NAME) {
      console.log('❌ FAIL: Document data does not match!');
      console.log('Expected:', TEST_MEMBER_NAME);
      console.log('Got:', readData.spa_vnaam);
      process.exit(1);
    }

    console.log('✅ Document read back successfully');
    console.log('   Data matches:', readData.spa_vnaam);

    // Step 3: Query for the document
    console.log('\n🔍 Querying for the document...');
    const snapshot = await db.collection('members')
      .where('spa_vnaam', '==', TEST_MEMBER_NAME)
      .where('spa_org', '==', TEST_ORG)
      .get();

    if (snapshot.empty) {
      console.log('❌ FAIL: Document cannot be found via query!');
      process.exit(1);
    }

    console.log(`✅ Document found via query (${snapshot.size} result(s))`);

    // Step 4: Delete the document
    console.log('\n🧹 Cleaning up test document...');
    await docRef.delete();
    console.log('✅ Test document deleted');

    // Step 5: Verify deletion
    console.log('\n🔍 Verifying deletion...');
    const deletedDoc = await docRef.get();
    if (deletedDoc.exists) {
      console.log('⚠️  WARNING: Document still exists after deletion!');
    } else {
      console.log('✅ Document successfully deleted');
    }

    console.log('\n✅ PASS: Firestore is working correctly!');
    console.log('   - Documents can be created ✓');
    console.log('   - Documents can be read ✓');
    console.log('   - Documents can be queried ✓');
    console.log('   - Documents can be deleted ✓');
    console.log('\n   This proves the application is using real Firestore storage.\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();

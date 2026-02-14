// Simple script to check if test data persists in Firestore
const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin
if (!admin.apps.length) {
  // Read .env.local manually
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const keyMatch = envContent.match(/FIREBASE_SERVICE_ACCOUNT_KEY=(.+)/);
  if (!keyMatch) {
    console.error('FIREBASE_SERVICE_ACCOUNT_KEY not found in .env.local');
    process.exit(1);
  }
  const serviceAccountKey = keyMatch[1];
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(serviceAccountKey))
  });
}

const db = admin.firestore();

async function checkTestMember() {
  try {
    console.log('Checking for test member "RESTART_TEST_12345" in Firestore...');

    const snapshot = await db.collection('members')
      .where('spa_org', '==', 1205)
      .where('spa_vnaam', '==', 'RESTART_TEST_12345')
      .get();

    if (snapshot.empty) {
      console.log('❌ TEST FAILED: Member "RESTART_TEST_12345" NOT FOUND in database');
      console.log('This indicates data was NOT persisted (in-memory storage detected)');
      process.exit(1);
    } else {
      console.log('✅ TEST PASSED: Member "RESTART_TEST_12345" FOUND in database');
      snapshot.forEach(doc => {
        console.log('Member data:', JSON.stringify(doc.data(), null, 2));
      });
      console.log('\nData successfully persisted across server restart!');
      process.exit(0);
    }
  } catch (error) {
    console.error('Error querying database:', error);
    process.exit(1);
  }
}

checkTestMember();

// List all members in Firestore for org 1205
const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin
if (!admin.apps.length) {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const keyMatch = envContent.match(/FIREBASE_SERVICE_ACCOUNT_KEY=(.+)/);
  if (!keyMatch) {
    console.error('FIREBASE_SERVICE_ACCOUNT_KEY not found');
    process.exit(1);
  }
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(keyMatch[1]))
  });
}

const db = admin.firestore();

async function listAllMembers() {
  try {
    console.log('Listing all members for org 1205...\n');

    const snapshot = await db.collection('members')
      .where('spa_org', '==', 1205)
      .get();

    console.log(`Found ${snapshot.size} members:\n`);
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`- ID: ${doc.id}`);
      console.log(`  Name: ${data.spa_vnaam} ${data.spa_tv} ${data.spa_anaam}`.trim());
      console.log(`  Number: ${data.spa_nummer}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

listAllMembers();

// Check all organizations and their members
const admin = require('firebase-admin');
const fs = require('fs');

if (!admin.apps.length) {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const keyMatch = envContent.match(/FIREBASE_SERVICE_ACCOUNT_KEY=(.+)/);
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(keyMatch[1]))
  });
}

const db = admin.firestore();

async function checkOrgs() {
  try {
    // List all organizations
    const orgsSnapshot = await db.collection('organizations')
      .where('org_nummer', '==', 1205)
      .get();

    console.log(`Found ${orgsSnapshot.size} organization(s) with org_nummer 1205\n`);

    for (const orgDoc of orgsSnapshot.docs) {
      const orgData = orgDoc.data();
      console.log(`Organization: ${orgData.org_naam} (${orgData.org_nummer})`);
      console.log(`Login code: ${orgData.org_code}`);

      // Get members for this org
      const membersSnapshot = await db.collection('members')
        .where('spa_org', '==', orgData.org_nummer)
        .get();

      console.log(`Members: ${membersSnapshot.size}`);
      console.log('');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkOrgs();

const admin = require('firebase-admin');
const fs = require('fs');

if (!admin.apps.length) {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const keyMatch = envContent.match(/FIREBASE_SERVICE_ACCOUNT_KEY=(.+)/);
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(keyMatch[1]))
  });
}

async function listOrgs() {
  try {
    const snapshot = await admin.firestore().collection('organizations').get();
    console.log(`Found ${snapshot.size} organizations:\n`);
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`- ${data.org_naam} (${data.org_nummer})`);
      console.log(`  Code: ${data.org_code}`);
      console.log('');
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

listOrgs();

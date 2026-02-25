import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function main() {
  const orgsSnap = await db.collection('organizations').limit(5).get();
  console.log(`Found ${orgsSnap.size} organizations`);

  for (const doc of orgsSnap.docs) {
    const data = doc.data();
    console.log(`\nOrg ${data.org_nummer}: ${data.org_naam}`);
    console.log(`  Login: ${data.login_code}`);

    // Check for competitions
    const compsSnap = await db.collection('organizations')
      .doc(doc.id)
      .collection('competitions')
      .where('vast_beurten', '!=', 1)
      .limit(1)
      .get();

    if (!compsSnap.empty) {
      const comp = compsSnap.docs[0].data();
      console.log(`  Competition ${comp.comp_nr}: ${comp.comp_naam} (vast_beurten: ${comp.vast_beurten || 0})`);
    }
  }
}

main().catch(console.error);

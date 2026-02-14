import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const envContent = readFileSync('.env.local', 'utf8');
const serviceAccountMatch = envContent.match(/FIREBASE_SERVICE_ACCOUNT_KEY=(.+)/s);
if (!serviceAccountMatch) throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY not found');
const jsonStr = serviceAccountMatch[1].split('\n')[0].trim();
const serviceAccount = JSON.parse(jsonStr);

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function createTestPlayers() {
  const orgNr = 9999;
  const compNr = 1;

  // Create 3 test members
  const members = [
    { spa_nummer: 101, spa_vnaam: 'Jan', spa_tv: 'van', spa_anaam: 'Berg', spa_moy_lib: 3.5 },
    { spa_nummer: 102, spa_vnaam: 'Piet', spa_tv: '', spa_anaam: 'de Vries', spa_moy_lib: 2.8 },
    { spa_nummer: 103, spa_vnaam: 'Kees', spa_tv: 'van der', spa_anaam: 'Meer', spa_moy_lib: 4.2 },
  ];

  for (const member of members) {
    const memberRef = db.collection('ClubMatch/data/members').doc();
    await memberRef.set({
      org_nummer: orgNr,
      spa_nummer: member.spa_nummer,
      spa_vnaam: member.spa_vnaam,
      spa_tv: member.spa_tv,
      spa_anaam: member.spa_anaam,
      spa_moy_lib: member.spa_moy_lib,
      spa_moy_band: 0,
      spa_moy_3bkl: 0,
      spa_moy_3bgr: 0,
      spa_moy_kad: 0,
      created_at: new Date().toISOString(),
    });
    console.log(`Created member ${member.spa_vnaam} ${member.spa_anaam}`);
  }

  console.log('Test members created successfully!');
}

createTestPlayers().then(() => process.exit(0)).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

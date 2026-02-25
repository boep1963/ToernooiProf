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
  // Create test organization
  const orgNummer = 9338;
  const loginCode = `${orgNummer}_TEST338`;

  const orgRef = db.collection('organizations').doc(`org_${orgNummer}`);
  await orgRef.set({
    org_nummer: orgNummer,
    org_naam: 'Test Org Feature 338',
    login_code: loginCode,
    created_at: admin.firestore.FieldValue.serverTimestamp()
  });

  console.log(`✓ Created organization ${orgNummer} with login: ${loginCode}`);

  // Create test competition WITHOUT fixed turns
  const compNr = 1;
  const compRef = orgRef.collection('competitions').doc(`comp_${compNr}`);
  await compRef.set({
    comp_nr: compNr,
    comp_naam: 'Test Libre - No Fixed Turns',
    comp_datum: '2026-02-25',
    discipline: 1, // Libre
    punten_sys: 1, // WRV
    periode: 1,
    sorteren: 1,
    max_beurten: 25,
    vast_beurten: 0, // NOT using fixed turns - this is the key!
    org_nummer: orgNummer
  });

  console.log(`✓ Created competition ${compNr} (vast_beurten: 0)`);

  // Create test players
  const player1Nr = 1;
  const player2Nr = 2;

  await compRef.collection('players').doc(`player_${player1Nr}`).set({
    spc_nummer: player1Nr,
    spa_vnaam: 'Test',
    spa_tv: '',
    spa_anaam: 'Player One',
    spc_car_1: 50, // Target: 50 caramboles
    org_nummer: orgNummer,
    comp_nr: compNr
  });

  await compRef.collection('players').doc(`player_${player2Nr}`).set({
    spc_nummer: player2Nr,
    spa_vnaam: 'Test',
    spa_tv: '',
    spa_anaam: 'Player Two',
    spc_car_1: 50, // Target: 50 caramboles
    org_nummer: orgNummer,
    comp_nr: compNr
  });

  console.log(`✓ Created 2 test players (both with target 50 caramboles)`);

  // Create a match
  const matchRef = compRef.collection('matches').doc();
  await matchRef.set({
    nummer_A: player1Nr,
    naam_A: 'Test Player One',
    nummer_B: player2Nr,
    naam_B: 'Test Player Two',
    gespeeld: 0,
    periode: 1,
    org_nummer: orgNummer,
    comp_nr: compNr
  });

  console.log(`✓ Created match between players 1 and 2`);

  console.log(`\n=== Test Setup Complete ===`);
  console.log(`Login code: ${loginCode}`);
  console.log(`Competition: ${compNr} (vast_beurten: 0 - No fixed turns)`);
  console.log(`Players: Both have target of 50 caramboles`);
  console.log(`\nTo test Feature #338:`);
  console.log(`1. Login with: ${loginCode}`);
  console.log(`2. Navigate to: /competities/${compNr}/matrix`);
  console.log(`3. Click on the match cell`);
  console.log(`4. Enter: Player 1 achieved=30, Player 2 achieved=35 (both below 50)`);
  console.log(`5. Enter valid HS and beurten values`);
  console.log(`6. Click Controle, then Opslaan`);
  console.log(`7. Warning should appear: "Partij is niet uitgespeeld! Wilt u doorgaan?"`);
}

main().catch(console.error);

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountKey) {
  console.error('FIREBASE_SERVICE_ACCOUNT_KEY not set');
  process.exit(1);
}

let app;
if (getApps().length === 0) {
  app = initializeApp({
    credential: cert(JSON.parse(serviceAccountKey)),
  });
} else {
  app = getApps()[0];
}

const db = getFirestore(app);

async function seed() {
  const orgNr = 1205;
  const compNr = 1;

  // Create 3 test members
  const members = [
    { org_nummer: orgNr, lid_nummer: 101, voornaam: 'Jan', achternaam: 'Jansen', moy_libre: 5.0 },
    { org_nummer: orgNr, lid_nummer: 102, voornaam: 'Piet', achternaam: 'Pietersen', moy_libre: 4.5 },
    { org_nummer: orgNr, lid_nummer: 103, voornaam: 'Klaas', achternaam: 'Klaassen', moy_libre: 6.0 },
  ];

  console.log('Creating members...');
  for (const member of members) {
    const docRef = db.collection('ClubMatch/data/members').doc();
    await docRef.set(member);
    console.log(`  Created member ${member.voornaam} ${member.achternaam}`);
  }

  // Add players to competition
  const players = [
    { org_nummer: orgNr, spc_org: orgNr, spc_competitie: compNr, spc_nummer: 101, spc_naam: 'Jan Jansen', spc_moy_1: 5.0, spc_cartem_1: 125 },
    { org_nummer: orgNr, spc_org: orgNr, spc_competitie: compNr, spc_nummer: 102, spc_naam: 'Piet Pietersen', spc_moy_1: 4.5, spc_cartem_1: 113 },
    { org_nummer: orgNr, spc_org: orgNr, spc_competitie: compNr, spc_nummer: 103, spc_naam: 'Klaas Klaassen', spc_moy_1: 6.0, spc_cartem_1: 150 },
  ];

  console.log('Adding players to competition...');
  for (const player of players) {
    const docRef = db.collection('ClubMatch/data/competition_players').doc();
    await docRef.set(player);
    console.log(`  Added player ${player.spc_naam}`);
  }

  // Create 2 matches
  const matches = [
    {
      org_nummer: orgNr,
      comp_nr: compNr,
      nummer_A: 101,
      naam_A: 'Jan Jansen',
      cartem_A: 125,
      nummer_B: 102,
      naam_B: 'Piet Pietersen',
      cartem_B: 113,
      periode: 1,
      uitslag_code: `${compNr}_1_101_102`,
      gespeeld: 0,
      ronde: 1
    },
    {
      org_nummer: orgNr,
      comp_nr: compNr,
      nummer_A: 101,
      naam_A: 'Jan Jansen',
      cartem_A: 125,
      nummer_B: 103,
      naam_B: 'Klaas Klaassen',
      cartem_B: 150,
      periode: 1,
      uitslag_code: `${compNr}_1_101_103`,
      gespeeld: 0,
      ronde: 1
    }
  ];

  console.log('Creating matches...');
  for (const match of matches) {
    const docRef = db.collection('ClubMatch/data/matches').doc();
    await docRef.set(match);
    console.log(`  Created match ${match.naam_A} vs ${match.naam_B}`);
  }

  // Create 1 result for the first match
  const result = {
    org_nummer: orgNr,
    comp_nr: compNr,
    uitslag_code: `${compNr}_1_101_102`,
    sp_1_nr: 101,
    sp_1_cartem: 125,
    sp_1_cargem: 130,
    sp_1_hs: 15,
    sp_1_punt: 2,
    sp_2_nr: 102,
    sp_2_cartem: 113,
    sp_2_cargem: 100,
    sp_2_hs: 12,
    sp_2_punt: 0,
    brt: 35,
    gespeeld: 1
  };

  console.log('Creating test result...');
  const resultRef = db.collection('ClubMatch/data/results').doc();
  await resultRef.set(result);
  console.log(`  Created result for ${result.uitslag_code}`);

  // Mark first match as played
  const matchSnap = await db.collection('ClubMatch/data/matches')
    .where('uitslag_code', '==', `${compNr}_1_101_102`)
    .limit(1)
    .get();

  if (!matchSnap.empty) {
    await matchSnap.docs[0].ref.update({ gespeeld: 1 });
    console.log('  Marked match as played');
  }

  console.log('\nTest data seeded successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Error seeding data:', err);
  process.exit(1);
});

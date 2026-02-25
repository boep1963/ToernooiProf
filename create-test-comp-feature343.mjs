#!/usr/bin/env node
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function createTestCompetition() {
  try {
    // Get org 9338
    const orgSnapshot = await db.collection('organizations')
      .where('org_nummer', '==', 9338)
      .limit(1)
      .get();

    if (orgSnapshot.empty) {
      console.log('No organization found with org_nummer = 9338');
      process.exit(1);
    }

    const orgData = orgSnapshot.docs[0].data();
    console.log(`Using organization: ${orgData.org_naam} (#${orgData.org_nummer})`);

    // Get next competition number - just use a high number to avoid conflicts
    const nextCompNr = 9900 + Math.floor(Math.random() * 100);

    // Create competition with vast_beurten=1 and WRV point system
    const competitionData = {
      org_nummer: 9338,
      comp_nr: nextCompNr,
      comp_naam: `TEST Feature 343 - Vast Beurten WRV`,
      comp_datum: '2026-02-25',
      discipline: 1, // Libre
      punten_sys: 1, // WRV system
      periode: 1,
      sorteren: 1,
      max_beurten: 20, // Fixed 20 turns
      vast_beurten: 1, // FIXED TURNS ENABLED
      comp_moy_formula: 25,
      comp_min_car: 25,
      created_at: new Date().toISOString(),
    };

    const compRef = await db.collection('competitions').add(competitionData);
    console.log(`\n✅ Created competition #${nextCompNr}: ${competitionData.comp_naam}`);
    console.log(`   Document ID: ${compRef.id}`);
    console.log(`   vast_beurten: ${competitionData.vast_beurten}`);
    console.log(`   max_beurten: ${competitionData.max_beurten}`);
    console.log(`   punten_sys: ${competitionData.punten_sys} (WRV)`);

    // Add 2 test players
    const players = [
      { name: 'PlayerA Feature343', moyenne: 2.5 },
      { name: 'PlayerB Feature343', moyenne: 2.0 }
    ];

    console.log(`\n Adding test players...`);

    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      const playerData = {
        org_nummer: 9338,
        comp_nr: nextCompNr,
        spc_nummer: 900 + i + 1, // 901, 902
        spa_vnaam: player.name,
        spa_tv: '',
        spa_anaam: '',
        spa_moy_lib: player.moyenne,
        spc_car_1: Math.round(player.moyenne * 25), // Calculate target based on moyenne
        created_at: new Date().toISOString(),
      };

      await db.collection('competition_players').add(playerData);
      console.log(`   ✅ ${player.name} (moyenne: ${player.moyenne}, target: ${playerData.spc_car_1} car)`);
    }

    // Create a match between the two players
    const matchData = {
      org_nummer: 9338,
      comp_nr: nextCompNr,
      uitslag_code: `1_901_902`,
      nummer_A: 901,
      naam_A: 'PlayerA Feature343',
      nummer_B: 902,
      naam_B: 'PlayerB Feature343',
      gespeeld: 0,
      periode: 1,
      created_at: new Date().toISOString(),
    };

    await db.collection('matches').add(matchData);
    console.log(`\n✅ Created match: PlayerA Feature343 vs PlayerB Feature343`);

    console.log(`\n📋 Test Setup Complete!`);
    console.log(`   Competition #${nextCompNr}`);
    console.log(`   Login code: ${orgData.org_wl_code}`);
    console.log(`   URL: http://localhost:3010/competities/${nextCompNr}/matrix`);
    console.log(`\n🎯 Test Scenario:`);
    console.log(`   PlayerA target: 63 car (moyenne 2.5 × 25)`);
    console.log(`   PlayerB target: 50 car (moyenne 2.0 × 25)`);
    console.log(`   Fill in: PlayerA 70 car (111.111%), PlayerB 60 car (120.000%)`);
    console.log(`   Expected: PlayerB wins (120% > 111.111%)`);

  } catch (error) {
    console.error('Error:', error);
  }

  process.exit(0);
}

createTestCompetition();

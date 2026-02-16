#!/usr/bin/env node

/**
 * Verification script: Check all Firestore documents for org_nummer type consistency.
 *
 * This script scans all collections and reports:
 * - Documents with org_nummer as string (should be number)
 * - Documents with org_nummer as number (correct)
 * - Collections that use org_nummer
 *
 * Usage:
 *   chmod +x verify-org-nummer-types.mjs
 *   ./verify-org-nummer-types.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname);

// Load environment variables
function loadEnv() {
  const envPath = path.join(projectRoot, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('ERROR: .env.local not found.');
    process.exit(1);
  }
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.substring(0, eqIdx).trim();
    let value = trimmed.substring(eqIdx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnv();

// Initialize Firebase
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function initFirebase() {
  if (getApps().length > 0) return getApps()[0];
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    console.error('ERROR: FIREBASE_SERVICE_ACCOUNT_KEY not set.');
    process.exit(1);
  }
  const creds = JSON.parse(raw);
  return initializeApp({ credential: cert(creds) });
}

const app = initFirebase();
const firestore = getFirestore(app);
const PREFIX = 'ClubMatch/data';

function col(name) {
  return firestore.collection(`${PREFIX}/${name}`);
}

// Collections that should have org_nummer field
const COLLECTIONS_WITH_ORG_NUMMER = [
  'organizations',
  'members',
  'competitions',
  'competition_players',
  'matches',
  'results',
  'tables',
  'device_config',
  'score_helpers',
  'score_helpers_tablet',
];

async function verifyCollection(collectionName) {
  console.log(`\n📂 Checking collection: ${collectionName}`);

  const snapshot = await col(collectionName).get();

  if (snapshot.empty) {
    console.log(`   ⚠️  Collection is empty`);
    return;
  }

  let numberCount = 0;
  let stringCount = 0;
  let missingCount = 0;
  let otherTypeCount = 0;
  const exampleStrings = [];
  const exampleOther = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    const orgNummer = data.org_nummer;

    if (orgNummer === undefined || orgNummer === null) {
      missingCount++;
    } else if (typeof orgNummer === 'number') {
      numberCount++;
    } else if (typeof orgNummer === 'string') {
      stringCount++;
      if (exampleStrings.length < 3) {
        exampleStrings.push({ id: doc.id, value: orgNummer });
      }
    } else {
      otherTypeCount++;
      if (exampleOther.length < 3) {
        exampleOther.push({ id: doc.id, type: typeof orgNummer, value: orgNummer });
      }
    }
  });

  console.log(`   Total documents: ${snapshot.size}`);
  console.log(`   ✅ org_nummer as number: ${numberCount}`);

  if (stringCount > 0) {
    console.log(`   ❌ org_nummer as string: ${stringCount}`);
    console.log(`      Examples:`, exampleStrings);
  }

  if (otherTypeCount > 0) {
    console.log(`   ❌ org_nummer as other type: ${otherTypeCount}`);
    console.log(`      Examples:`, exampleOther);
  }

  if (missingCount > 0) {
    console.log(`   ⚠️  Missing org_nummer: ${missingCount}`);
  }

  return {
    collection: collectionName,
    total: snapshot.size,
    numberCount,
    stringCount,
    otherTypeCount,
    missingCount,
  };
}

async function main() {
  console.log('🔍 Verifying org_nummer type consistency in Firestore...\n');
  console.log('Expected: All org_nummer fields should be of type NUMBER\n');

  const results = [];

  for (const collectionName of COLLECTIONS_WITH_ORG_NUMMER) {
    try {
      const result = await verifyCollection(collectionName);
      if (result) results.push(result);
    } catch (error) {
      console.error(`   ❌ Error checking ${collectionName}:`, error.message);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));

  const totalDocs = results.reduce((sum, r) => sum + r.total, 0);
  const totalNumbers = results.reduce((sum, r) => sum + r.numberCount, 0);
  const totalStrings = results.reduce((sum, r) => sum + r.stringCount, 0);
  const totalOther = results.reduce((sum, r) => sum + r.otherTypeCount, 0);
  const totalMissing = results.reduce((sum, r) => sum + r.missingCount, 0);

  console.log(`Total documents checked: ${totalDocs}`);
  console.log(`✅ Correct (number):     ${totalNumbers} (${(totalNumbers/totalDocs*100).toFixed(1)}%)`);
  console.log(`❌ Wrong (string):       ${totalStrings} (${(totalStrings/totalDocs*100).toFixed(1)}%)`);
  console.log(`❌ Wrong (other):        ${totalOther} (${(totalOther/totalDocs*100).toFixed(1)}%)`);
  console.log(`⚠️  Missing:             ${totalMissing} (${(totalMissing/totalDocs*100).toFixed(1)}%)`);

  if (totalStrings === 0 && totalOther === 0) {
    console.log('\n✅ All org_nummer fields are correctly typed as NUMBER!');
  } else {
    console.log('\n⚠️  WARNING: Some documents have incorrect org_nummer types.');
    console.log('   Run a migration script to fix these issues.');
  }

  process.exit(0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

#!/usr/bin/env node

/**
 * Check what type org_nummer has for org 1205 in matches and tables collections
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname);

// Load environment
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

async function checkCollection(collectionName) {
  console.log(`\n📂 Checking ${collectionName} collection for org 1205:`);

  // Try querying with number
  const numberQuery = await firestore
    .collection(`${PREFIX}/${collectionName}`)
    .where('org_nummer', '==', 1205)
    .limit(5)
    .get();

  console.log(`   Query with number (1205): ${numberQuery.size} results`);
  if (!numberQuery.empty) {
    const sample = numberQuery.docs[0].data();
    console.log(`   Sample org_nummer type: ${typeof sample.org_nummer}`);
    console.log(`   Sample org_nummer value: ${sample.org_nummer}`);
  }

  // Try querying with string
  const stringQuery = await firestore
    .collection(`${PREFIX}/${collectionName}`)
    .where('org_nummer', '==', '1205')
    .limit(5)
    .get();

  console.log(`   Query with string ("1205"): ${stringQuery.size} results`);
  if (!stringQuery.empty) {
    const sample = stringQuery.docs[0].data();
    console.log(`   Sample org_nummer type: ${typeof sample.org_nummer}`);
    console.log(`   Sample org_nummer value: ${sample.org_nummer}`);
  }

  // Get all documents for this org (scan without filter)
  const allDocs = await firestore
    .collection(`${PREFIX}/${collectionName}`)
    .limit(100)
    .get();

  console.log(`   Total documents in collection (first 100): ${allDocs.size}`);

  // Find any with 1205 in org_nummer
  let found1205 = 0;
  allDocs.forEach(doc => {
    const data = doc.data();
    if (data.org_nummer === 1205 || data.org_nummer === '1205') {
      found1205++;
      console.log(`   Found doc ${doc.id}: org_nummer = ${data.org_nummer} (type: ${typeof data.org_nummer})`);
    }
  });

  if (found1205 === 0) {
    console.log(`   ⚠️  No documents found with org_nummer 1205 in first 100 docs`);
  }
}

async function main() {
  console.log('🔍 Checking org_nummer types for org 1205...\n');

  await checkCollection('matches');
  await checkCollection('tables');
  await checkCollection('competitions');
  await checkCollection('members');

  process.exit(0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

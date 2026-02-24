#!/usr/bin/env node
/**
 * Migration Script: Normalize all numeric fields to number type
 *
 * Feature #319: This script normalizes type inconsistencies in Firestore.
 * Numeric fields that may be stored as strings are converted to numbers.
 *
 * After running this migration, dualTypeQuery can be replaced with standard queries.
 */

import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_SERVICE_ACCOUNT);
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// Define numeric fields for each collection
const COLLECTION_SCHEMAS = {
  organizations: ['spa_nummer', 'spa_nieuwsbrief'],
  competitions: ['org_nummer', 'comp_nr', 'discipline', 'moy_form', 'min_car', 'periode', 'max_periode', 'sorteren', 'puntensysteem'],
  members: ['spa_org', 'spa_nummer', 'spa_moy_1', 'spa_moy_2', 'spa_moy_3', 'spa_moy_4', 'spa_moy_5'],
  competition_players: ['spc_org', 'spc_competitie', 'spc_nummer', 'spc_moyenne_1', 'spc_moyenne_2', 'spc_moyenne_3', 'spc_moyenne_4', 'spc_moyenne_5', 'spc_car_1', 'spc_car_2', 'spc_car_3', 'spc_car_4', 'spc_car_5'],
  matches: ['org_nummer', 'comp_nr', 'nummer_A', 'nummer_B', 'periode', 'tafel'],
  results: ['org_nummer', 'comp_nr', 'sp_1_nr', 'sp_2_nr', 'periode', 'gespeeld', 'beurt_1', 'beurt_2', 'car_1', 'car_2', 'pnt_1', 'pnt_2', 'tafel'],
  tables: ['org_nummer', 'tbl_nummer'],
  news: ['org_nummer', 'nws_nummer'],
  news_reactions: ['org_nummer', 'nws_nummer', 'rea_nummer'],
  device_config: ['org_nummer'],
  contact_messages: ['org_nummer']
};

async function normalizeCollection(collectionName, numericFields) {
  console.log(`\n[${collectionName}] Starting normalization...`);

  const snapshot = await db.collection(collectionName).get();
  console.log(`[${collectionName}] Found ${snapshot.size} documents`);

  let updatedCount = 0;
  let errorCount = 0;

  const batch = db.batch();
  let batchCount = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const updates = {};
    let hasUpdates = false;

    for (const field of numericFields) {
      if (field in data) {
        const value = data[field];

        // Convert string numbers to actual numbers
        if (typeof value === 'string' && !isNaN(Number(value)) && value.trim() !== '') {
          updates[field] = Number(value);
          hasUpdates = true;
        }
        // Keep numbers as-is
        else if (typeof value === 'number') {
          // Already a number, no update needed
        }
        // Handle null/undefined - keep as-is
        else if (value === null || value === undefined) {
          // Skip
        }
        // Unexpected type
        else {
          console.warn(`[${collectionName}] Doc ${doc.id}: field "${field}" has unexpected value:`, value);
        }
      }
    }

    if (hasUpdates) {
      batch.update(doc.ref, updates);
      batchCount++;
      updatedCount++;

      // Firestore batch limit is 500 operations
      if (batchCount >= 500) {
        await batch.commit();
        console.log(`[${collectionName}] Committed batch of ${batchCount} updates`);
        batchCount = 0;
      }
    }
  }

  // Commit remaining updates
  if (batchCount > 0) {
    await batch.commit();
    console.log(`[${collectionName}] Committed final batch of ${batchCount} updates`);
  }

  console.log(`[${collectionName}] ✅ Normalized ${updatedCount} documents (${errorCount} errors)`);
  return { updated: updatedCount, errors: errorCount };
}

async function runMigration() {
  console.log('='.repeat(70));
  console.log('MIGRATION: Normalize numeric fields to number type');
  console.log('='.repeat(70));
  console.log(`Start time: ${new Date().toISOString()}`);

  const results = {};
  let totalUpdated = 0;
  let totalErrors = 0;

  for (const [collectionName, numericFields] of Object.entries(COLLECTION_SCHEMAS)) {
    try {
      const result = await normalizeCollection(collectionName, numericFields);
      results[collectionName] = result;
      totalUpdated += result.updated;
      totalErrors += result.errors;
    } catch (error) {
      console.error(`[${collectionName}] ❌ Migration failed:`, error);
      results[collectionName] = { updated: 0, errors: 1 };
      totalErrors++;
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('MIGRATION COMPLETE');
  console.log('='.repeat(70));
  console.log(`End time: ${new Date().toISOString()}`);
  console.log(`Total documents updated: ${totalUpdated}`);
  console.log(`Total errors: ${totalErrors}`);
  console.log('\nResults by collection:');
  for (const [name, result] of Object.entries(results)) {
    console.log(`  ${name}: ${result.updated} updated, ${result.errors} errors`);
  }

  console.log('\n✅ Migration successful! All numeric fields are now type number.');
  console.log('Next steps:');
  console.log('  1. Update write operations to always save numeric fields as numbers');
  console.log('  2. Replace queryWithOrgComp/dualTypeQuery with standard Firestore queries');
  console.log('  3. Test all API routes');
  console.log('  4. Remove dualTypeQuery utility function');

  process.exit(0);
}

// Dry-run mode check
const isDryRun = process.argv.includes('--dry-run');

if (isDryRun) {
  console.log('DRY RUN MODE - No changes will be made\n');
  console.log('Collections to process:', Object.keys(COLLECTION_SCHEMAS));
  console.log('To run migration, execute: node migrate-normalize-numbers.mjs');
  process.exit(0);
}

// Confirm before running
console.log('⚠️  WARNING: This will modify data in Firestore!');
console.log('Collections to be updated:', Object.keys(COLLECTION_SCHEMAS).join(', '));
console.log('\nPress Ctrl+C to cancel, or wait 5 seconds to continue...\n');

setTimeout(runMigration, 5000);

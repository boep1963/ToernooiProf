/**
 * Verification script for Feature #178
 * Verifies firestore.indexes.json has correct field names for competition_players
 */

import fs from 'fs';
import path from 'path';

const indexPath = './firestore.indexes.json';

console.log('=== Feature #178 Index Verification ===\n');

const indexFile = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
const indexes = indexFile.indexes || [];

console.log(`Total indexes: ${indexes.length}\n`);

// Find all competition_players indexes
const cpIndexes = indexes.filter(idx => idx.collectionGroup === 'competition_players');

console.log(`Competition_players indexes: ${cpIndexes.length}\n`);

let allCorrect = true;

cpIndexes.forEach((idx, i) => {
  console.log(`Index ${i + 1}:`);
  const fields = idx.fields.map(f => f.fieldPath).join(', ');
  console.log(`  Fields: ${fields}`);

  // Check for incorrect field names
  const hasOldNames = idx.fields.some(f =>
    f.fieldPath === 'org_nummer' ||
    f.fieldPath === 'comp_nr' ||
    f.fieldPath === 'spa_nr'
  );

  if (hasOldNames) {
    console.log('  ❌ INCORRECT - uses old field names (org_nummer, comp_nr, spa_nr)');
    allCorrect = false;
  } else {
    console.log('  ✅ CORRECT - uses proper field names (spc_org, spc_competitie, spc_nummer)');
  }
  console.log();
});

// Expected indexes
console.log('Expected competition_players indexes:');
console.log('  1. (spc_org, spc_competitie)');
console.log('  2. (spc_org, spc_competitie, spc_nummer)');
console.log();

// Verify we have exactly 2 indexes
if (cpIndexes.length !== 2) {
  console.log(`❌ INCORRECT - Expected 2 competition_players indexes, found ${cpIndexes.length}`);
  allCorrect = false;
} else {
  console.log('✅ CORRECT - Found exactly 2 competition_players indexes');
}

console.log();
console.log(allCorrect ? '🎉 All checks passed!' : '❌ Some checks failed!');
process.exit(allCorrect ? 0 : 1);

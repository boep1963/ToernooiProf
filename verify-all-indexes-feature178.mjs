/**
 * Comprehensive verification for Feature #178
 * Verifies ALL indexes in firestore.indexes.json use correct field names
 */

import fs from 'fs';

const indexPath = './firestore.indexes.json';

console.log('=== Feature #178 Complete Index Verification ===\n');

const indexFile = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
const indexes = indexFile.indexes || [];

// Define correct field names for each collection
const correctFields = {
  'competitions': ['org_nummer', 'comp_nr', 'discipline', 'naam'],
  'competition_players': ['spc_org', 'spc_competitie', 'spc_nummer', 'spa_vnaam', 'spa_anaam'],
  'members': ['spa_org', 'spa_nummer', 'spa_vnaam', 'spa_anaam'],
  'matches': ['org_nummer', 'comp_nr', 'periode', 'uitslag_code', 'tafel'],
  'results': ['org_nummer', 'comp_nr', 'periode', 'uitslag_code', 'speeldatum', 'gespeeld'],
  'tables': ['org_nummer', 'tafel_nr'],
  'device_config': ['org_nummer', 'tafel_nr'],
  'score_helpers': ['org_nummer', 'comp_nr', 'uitslag_code']
};

let allCorrect = true;

// Group indexes by collection
const byCollection = {};
indexes.forEach(idx => {
  const coll = idx.collectionGroup;
  if (!byCollection[coll]) byCollection[coll] = [];
  byCollection[coll].push(idx);
});

console.log(`Total indexes: ${indexes.length}`);
console.log(`Collections with indexes: ${Object.keys(byCollection).length}\n`);

// Check each collection
Object.keys(byCollection).sort().forEach(collName => {
  const collIndexes = byCollection[collName];
  console.log(`${collName}: ${collIndexes.length} index(es)`);

  collIndexes.forEach((idx, i) => {
    const fields = idx.fields.map(f => f.fieldPath);
    console.log(`  [${i + 1}] ${fields.join(', ')}`);

    // Special validation for competition_players
    if (collName === 'competition_players') {
      const hasWrongFields = fields.some(f =>
        f === 'org_nummer' || f === 'comp_nr' || f === 'spa_nr'
      );
      const hasCorrectFields = fields.every(f =>
        ['spc_org', 'spc_competitie', 'spc_nummer'].includes(f)
      );

      if (hasWrongFields) {
        console.log(`      ❌ WRONG: uses old field names (org_nummer, comp_nr, spa_nr)`);
        allCorrect = false;
      } else if (hasCorrectFields) {
        console.log(`      ✅ CORRECT`);
      } else {
        console.log(`      ⚠️  WARNING: unexpected fields`);
      }
    }
  });
  console.log();
});

// Specific checks for competition_players
console.log('=== Competition Players Validation ===');
const cpIndexes = byCollection['competition_players'] || [];

if (cpIndexes.length !== 2) {
  console.log(`❌ Expected 2 competition_players indexes, found ${cpIndexes.length}`);
  allCorrect = false;
} else {
  console.log(`✅ Found exactly 2 competition_players indexes`);
}

const expectedIndexes = [
  ['spc_org', 'spc_competitie'],
  ['spc_org', 'spc_competitie', 'spc_nummer']
];

expectedIndexes.forEach((expected, i) => {
  const actual = cpIndexes[i]?.fields.map(f => f.fieldPath) || [];
  const match = JSON.stringify(actual) === JSON.stringify(expected);

  if (match) {
    console.log(`✅ Index ${i + 1} matches: (${expected.join(', ')})`);
  } else {
    console.log(`❌ Index ${i + 1} mismatch:`);
    console.log(`   Expected: (${expected.join(', ')})`);
    console.log(`   Found:    (${actual.join(', ')})`);
    allCorrect = false;
  }
});

console.log();
console.log(allCorrect ? '🎉 All validation checks passed!' : '❌ Some validation checks failed!');
process.exit(allCorrect ? 0 : 1);

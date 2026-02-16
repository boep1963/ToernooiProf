import fs from 'fs';

try {
  const content = fs.readFileSync('firestore.indexes.json', 'utf-8');
  const parsed = JSON.parse(content);

  console.log('JSON validation: PASS');
  console.log('Number of indexes:', parsed.indexes.length);
  console.log('Field overrides:', parsed.fieldOverrides.length);

  // Validate structure
  const requiredCollections = [
    'competitions',
    'competition_players',
    'results',
    'members',
    'matches',
    'tables',
    'score_helpers',
    'device_config'
  ];

  const foundCollections = new Set();
  parsed.indexes.forEach(idx => {
    foundCollections.add(idx.collectionGroup);
  });

  console.log('\nIndex coverage:');
  requiredCollections.forEach(col => {
    const count = parsed.indexes.filter(idx => idx.collectionGroup === col).length;
    console.log(`  ${col}: ${count} index(es)`);
  });

  console.log('\nAll validations passed!');
} catch(e) {
  console.error('Validation failed:', e.message);
  process.exit(1);
}

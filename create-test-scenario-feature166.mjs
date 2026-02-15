#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';

// Read current data files
const matchesPath = '.data/matches.json';
const resultsPath = '.data/results.json';

const matches = JSON.parse(readFileSync(matchesPath, 'utf8'));
const results = JSON.parse(readFileSync(resultsPath, 'utf8'));

// Backup the matches file
const backup = { ...matches };

// Filter out all matches for comp_nr 1 (but keep results)
const filteredMatches = {};
Object.entries(matches).forEach(([id, match]) => {
  if (match.comp_nr !== 1) {
    filteredMatches[id] = match;
  }
});

console.log('Original matches count:', Object.keys(matches).length);
console.log('Matches after removing comp 1:', Object.keys(filteredMatches).length);
console.log('Results for comp 1:', Object.values(results).filter(r => r.comp_nr === 1).length);

// Write the filtered matches
writeFileSync(matchesPath, JSON.stringify(filteredMatches, null, 2));
console.log('\n✅ Matches file updated');
console.log('📝 Backup available in variable if needed');
console.log('\nTo restore, run:');
console.log('  echo \'' + JSON.stringify(backup, null, 2) + '\' > .data/matches.json');

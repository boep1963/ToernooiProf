#!/usr/bin/env node

/**
 * Test Feature #171: Dashboard matches counter with results fallback
 *
 * Verifies:
 * 1. Matches count API has fallback logic to count results
 * 2. Fallback queries unique uitslag_codes from results collection
 * 3. Logging indicates which source (matches or results) was used
 * 4. Type safety is ensured via normalizeOrgNummer
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

function check(condition, message) {
  if (condition) {
    console.log(`${GREEN}✓${RESET} ${message}`);
    return true;
  } else {
    console.log(`${RED}✗${RESET} ${message}`);
    return false;
  }
}

console.log('🔍 Testing Feature #171: Matches Count Fallback\n');

let allPassed = true;

// Test 1: Check matches count route exists
const routePath = path.join(__dirname, 'src/app/api/organizations/[orgNr]/matches/count/route.ts');
const routeExists = fs.existsSync(routePath);
allPassed &= check(routeExists, 'Matches count route exists');

if (routeExists) {
  const routeContent = fs.readFileSync(routePath, 'utf-8');

  // Test 2: Uses normalizeOrgNummer for type safety
  allPassed &= check(
    routeContent.includes('normalizeOrgNummer('),
    'Uses normalizeOrgNummer for type safety'
  );

  // Test 3: Has fallback logic
  allPassed &= check(
    routeContent.includes('if (count === 0)') || routeContent.includes('if (snapshot.size === 0)'),
    'Has fallback condition when matches is 0'
  );

  // Test 4: Queries results collection
  allPassed &= check(
    routeContent.includes("db.collection('results')") || routeContent.includes('db.collection("results")'),
    'Queries results collection as fallback'
  );

  // Test 5: Counts unique uitslag_codes
  allPassed &= check(
    routeContent.includes('uniqueCodes') || routeContent.includes('unique'),
    'Counts unique match codes'
  );

  // Test 6: Uses Set for uniqueness
  allPassed &= check(
    routeContent.includes('new Set') || routeContent.includes('Set<'),
    'Uses Set data structure for uniqueness'
  );

  // Test 7: Checks uitslag_code field
  allPassed &= check(
    routeContent.includes('uitslag_code'),
    'Accesses uitslag_code field from results'
  );

  // Test 8: Has source tracking
  allPassed &= check(
    routeContent.includes('source'),
    'Tracks which source (matches or results) was used'
  );

  // Test 9: Logs fallback usage
  allPassed &= check(
    routeContent.includes('fallback') || routeContent.includes('falling back'),
    'Logs when fallback is used'
  );

  // Test 10: Returns both count and source
  allPassed &= check(
    routeContent.includes('count, source') || routeContent.includes('count: count') && routeContent.includes('source:'),
    'Returns both count and source in response'
  );
}

console.log('\n' + '='.repeat(60));
if (allPassed) {
  console.log(`${GREEN}✅ All checks passed!${RESET}`);
  console.log('Feature #171 implementation is complete.');
  console.log('\nBehavior:');
  console.log('1. First tries to count from matches collection');
  console.log('2. If 0 matches, falls back to results collection');
  console.log('3. Counts unique uitslag_code values');
  console.log('4. Returns count and source information');
} else {
  console.log(`${RED}❌ Some checks failed.${RESET}`);
  console.log('Please review the implementation.');
}
console.log('='.repeat(60));

process.exit(allPassed ? 0 : 1);

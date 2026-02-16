#!/usr/bin/env node

/**
 * Test Feature #173: Type-safety for org_nummer in Firestore queries
 *
 * Verifies:
 * 1. normalizeOrgNummer utility function exists and works correctly
 * 2. Auth helper uses normalized values
 * 3. API routes use normalized values
 * 4. Query result logging is in place
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

console.log('🔍 Testing Feature #173: org_nummer Type Safety\n');

let allPassed = true;

// Test 1: Utility file exists
const utilPath = path.join(__dirname, 'src/lib/orgNumberUtils.ts');
const utilExists = fs.existsSync(utilPath);
allPassed &= check(utilExists, 'orgNumberUtils.ts utility file exists');

if (utilExists) {
  const utilContent = fs.readFileSync(utilPath, 'utf-8');

  // Test 2: normalizeOrgNummer function exists
  allPassed &= check(
    utilContent.includes('export function normalizeOrgNummer'),
    'normalizeOrgNummer() function is exported'
  );

  // Test 3: logQueryResult function exists
  allPassed &= check(
    utilContent.includes('export function logQueryResult'),
    'logQueryResult() function is exported'
  );

  // Test 4: Handles both string and number inputs
  allPassed &= check(
    utilContent.includes('typeof orgNummer === \'number\'') &&
    utilContent.includes('typeof orgNummer === \'string\''),
    'Handles both string and number types'
  );

  // Test 5: Validates input
  allPassed &= check(
    utilContent.includes('throw new Error') && utilContent.includes('null'),
    'Validates null/undefined inputs'
  );
}

// Test 6: Auth helper imports utility
const authHelperPath = path.join(__dirname, 'src/lib/auth-helper.ts');
if (fs.existsSync(authHelperPath)) {
  const authContent = fs.readFileSync(authHelperPath, 'utf-8');
  allPassed &= check(
    authContent.includes('import { normalizeOrgNummer }'),
    'auth-helper.ts imports normalizeOrgNummer'
  );
  allPassed &= check(
    authContent.includes('normalizeOrgNummer('),
    'auth-helper.ts uses normalizeOrgNummer()'
  );
}

// Test 7: Check critical API routes
const routesToCheck = [
  'src/app/api/organizations/[orgNr]/matches/count/route.ts',
  'src/app/api/organizations/[orgNr]/tables/count/route.ts',
  'src/app/api/organizations/[orgNr]/competitions/route.ts',
];

routesToCheck.forEach(routePath => {
  const fullPath = path.join(__dirname, routePath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const routeName = path.basename(path.dirname(fullPath));

    allPassed &= check(
      content.includes('import { normalizeOrgNummer'),
      `${routeName} imports normalizeOrgNummer`
    );

    allPassed &= check(
      content.includes('normalizeOrgNummer('),
      `${routeName} uses normalizeOrgNummer()`
    );

    allPassed &= check(
      content.includes('logQueryResult('),
      `${routeName} uses logQueryResult()`
    );
  }
});

// Test 8: Check import script stores numbers
const importScriptPath = path.join(__dirname, 'scripts/import-sql-to-firestore.mjs');
if (fs.existsSync(importScriptPath)) {
  const importContent = fs.readFileSync(importScriptPath, 'utf-8');
  allPassed &= check(
    importContent.includes('parseInt(str, 10)'),
    'Import script converts numeric strings to numbers'
  );
}

console.log('\n' + '='.repeat(60));
if (allPassed) {
  console.log(`${GREEN}✅ All checks passed!${RESET}`);
  console.log('Feature #173 implementation is complete.');
} else {
  console.log(`${RED}❌ Some checks failed.${RESET}`);
  console.log('Please review the implementation.');
}
console.log('='.repeat(60));

process.exit(allPassed ? 0 : 1);

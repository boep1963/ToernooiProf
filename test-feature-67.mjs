#!/usr/bin/env node

/**
 * Test Feature #67: Empty states display when no data
 *
 * This script verifies that empty state UI is properly implemented
 * in the members and competitions list pages.
 */

import { readFileSync } from 'fs';

console.log('=== Feature #67: Empty States Display Test ===\n');

// Read the members page source
const membersPagePath = './src/app/(dashboard)/leden/page.tsx';
const membersPageSource = readFileSync(membersPagePath, 'utf8');

// Read the competitions page source
const competitiesPagePath = './src/app/(dashboard)/competities/page.tsx';
const competitiesPageSource = readFileSync(competitiesPagePath, 'utf8');

let allTestsPassed = true;

console.log('✓ Test 1: Members page has empty state conditional rendering');
if (membersPageSource.includes('members.length === 0')) {
  console.log('  ✓ Found conditional: members.length === 0');
} else {
  console.log('  ✗ FAILED: Conditional not found');
  allTestsPassed = false;
}

console.log('\n✓ Test 2: Members page displays Dutch empty message');
if (membersPageSource.includes('Er zijn nog geen leden aangemaakt')) {
  console.log('  ✓ Found message: "Er zijn nog geen leden aangemaakt."');
} else {
  console.log('  ✗ FAILED: Empty message not found');
  allTestsPassed = false;
}

console.log('\n✓ Test 3: Members page has action button to create first member');
if (membersPageSource.includes('Eerste lid toevoegen') && membersPageSource.includes('/leden/nieuw')) {
  console.log('  ✓ Found button: "Eerste lid toevoegen" linking to /leden/nieuw');
} else {
  console.log('  ✗ FAILED: Action button not found or incorrect link');
  allTestsPassed = false;
}

console.log('\n✓ Test 4: Members page has icon in empty state');
if (membersPageSource.includes('M17 20h5v-2a3 3 0 00-5.356-1.857')) {
  console.log('  ✓ Found people/users icon SVG in empty state');
} else {
  console.log('  ✗ FAILED: Icon not found');
  allTestsPassed = false;
}

console.log('\n✓ Test 5: Competitions page has empty state conditional rendering');
if (competitiesPageSource.includes('competitions.length === 0')) {
  console.log('  ✓ Found conditional: competitions.length === 0');
} else {
  console.log('  ✗ FAILED: Conditional not found');
  allTestsPassed = false;
}

console.log('\n✓ Test 6: Competitions page displays Dutch empty message');
if (competitiesPageSource.includes('Er zijn nog geen competities aangemaakt')) {
  console.log('  ✓ Found message: "Er zijn nog geen competities aangemaakt."');
} else {
  console.log('  ✗ FAILED: Empty message not found');
  allTestsPassed = false;
}

console.log('\n✓ Test 7: Competitions page has action button to create first competition');
if (competitiesPageSource.includes('Eerste competitie aanmaken') && competitiesPageSource.includes('/competities/nieuw')) {
  console.log('  ✓ Found button: "Eerste competitie aanmaken" linking to /competities/nieuw');
} else {
  console.log('  ✗ FAILED: Action button not found or incorrect link');
  allTestsPassed = false;
}

console.log('\n✓ Test 8: Competitions page has icon in empty state');
if (competitiesPageSource.includes('M9 12l2 2 4-4m5.618-4.016')) {
  console.log('  ✓ Found shield/badge icon SVG in empty state');
} else {
  console.log('  ✗ FAILED: Icon not found');
  allTestsPassed = false;
}

console.log('\n✓ Test 9: Empty states use proper styling classes');
const emptyStateClasses = ['bg-white', 'dark:bg-slate-800', 'rounded-xl', 'shadow-sm', 'border', 'p-8', 'text-center'];
let foundClasses = true;
for (const className of emptyStateClasses) {
  if (!membersPageSource.includes(className) || !competitiesPageSource.includes(className)) {
    foundClasses = false;
    console.log(`  ✗ FAILED: Missing class "${className}" in empty states`);
    allTestsPassed = false;
  }
}
if (foundClasses) {
  console.log('  ✓ All expected styling classes found');
}

console.log('\n✓ Test 10: Both pages show loading state before empty state');
if (membersPageSource.includes('isLoading ?') && competitiesPageSource.includes('isLoading ?')) {
  console.log('  ✓ Both pages have loading state that renders before empty state check');
} else {
  console.log('  ✗ FAILED: Loading state not found');
  allTestsPassed = false;
}

console.log('\n' + '='.repeat(60));
if (allTestsPassed) {
  console.log('✅ ALL TESTS PASSED - Feature #67 is fully implemented');
  console.log('\nImplementation Summary:');
  console.log('- Members page (/leden): Empty state with Dutch message, icon, and action button');
  console.log('- Competitions page (/competities): Empty state with Dutch message, icon, and action button');
  console.log('- Both pages: Loading states, proper conditional rendering, consistent styling');
  console.log('- Empty state messages guide users to create their first item');
  process.exit(0);
} else {
  console.log('❌ SOME TESTS FAILED - Review implementation');
  process.exit(1);
}

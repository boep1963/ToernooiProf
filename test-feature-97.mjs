#!/usr/bin/env node

/**
 * Test Feature #97: Form defaults set correctly for competitions
 *
 * This script verifies that the competition creation form has sensible defaults.
 */

import { readFileSync } from 'fs';

console.log('=== Feature #97: Competition Form Defaults Test ===\n');

// Read the competition creation form source
const formPath = './src/app/(dashboard)/competities/nieuw/page.tsx';
const formSource = readFileSync(formPath, 'utf8');

let allTestsPassed = true;

console.log('✓ Test 1: Date defaults to today');
if (formSource.includes("comp_datum: new Date().toISOString().split('T')[0]")) {
  console.log('  ✓ Found: comp_datum defaults to today\'s date');
} else {
  console.log('  ✗ FAILED: Date default not found');
  allTestsPassed = false;
}

console.log('\n✓ Test 2: Discipline has a default');
if (formSource.includes('discipline: 1')) {
  console.log('  ✓ Found: discipline defaults to 1 (Libre)');
} else {
  console.log('  ✗ FAILED: Discipline default not found');
  allTestsPassed = false;
}

console.log('\n✓ Test 3: Scoring system has a default');
if (formSource.includes('punten_sys: 1')) {
  console.log('  ✓ Found: punten_sys defaults to 1 (WRV 2-1-0)');
} else {
  console.log('  ✗ FAILED: Scoring system default not found');
  allTestsPassed = false;
}

console.log('\n✓ Test 4: Moyenne formula has sensible default');
if (formSource.includes('moy_form: 3')) {
  console.log('  ✓ Found: moy_form defaults to 3 (x3 multiplier)');
} else {
  console.log('  ✗ FAILED: Moyenne formula default not found');
  allTestsPassed = false;
}

console.log('\n✓ Test 5: Min caramboles defaults to 0');
if (formSource.includes('min_car: 0')) {
  console.log('  ✓ Found: min_car defaults to 0 (no minimum)');
} else {
  console.log('  ✗ FAILED: Min caramboles should default to 0');
  allTestsPassed = false;
}

console.log('\n✓ Test 6: Max turns defaults to 0 (unlimited)');
if (formSource.includes('max_beurten: 0')) {
  console.log('  ✓ Found: max_beurten defaults to 0 (unlimited)');
} else {
  console.log('  ✗ FAILED: Max turns should default to 0');
  allTestsPassed = false;
}

console.log('\n✓ Test 7: Form fields allow 0 values');
const hasMinZero = formSource.match(/min="0"[^>]*name="min_car"/s) !== null ||
                   formSource.match(/name="min_car"[^>]*min="0"/s) !== null;
const hasMaxZero = formSource.match(/min="0"[^>]*name="max_beurten"/s) !== null ||
                   formSource.match(/name="max_beurten"[^>]*min="0"/s) !== null;

if (hasMinZero && hasMaxZero) {
  console.log('  ✓ Both min_car and max_beurten inputs accept 0 (min="0")');
} else {
  console.log(`  ✗ FAILED: Inputs should accept 0 values (min_car: ${hasMinZero}, max_beurten: ${hasMaxZero})`);
  allTestsPassed = false;
}

console.log('\n✓ Test 8: Vaste beurten defaults appropriately');
if (formSource.includes('vast_beurten: 0')) {
  console.log('  ✓ Found: vast_beurten defaults to 0 (Nee)');
} else {
  console.log('  ✗ FAILED: Vaste beurten default not found');
  allTestsPassed = false;
}

console.log('\n✓ Test 9: Sorteren has a default');
if (formSource.includes('sorteren: 1')) {
  console.log('  ✓ Found: sorteren defaults to 1 (Voornaam eerst)');
} else {
  console.log('  ✗ FAILED: Sorteren default not found');
  allTestsPassed = false;
}

console.log('\n✓ Test 10: Comp_naam starts empty (user must provide)');
if (formSource.includes("comp_naam: ''")) {
  console.log('  ✓ Found: comp_naam starts empty (required field)');
} else {
  console.log('  ✗ FAILED: Comp_naam should start empty');
  allTestsPassed = false;
}

console.log('\n' + '='.repeat(60));
if (allTestsPassed) {
  console.log('✅ ALL TESTS PASSED - Feature #97 is fully implemented');
  console.log('\nDefault Values Summary:');
  console.log('- comp_naam: empty (required, user must provide)');
  console.log('- comp_datum: today\'s date');
  console.log('- discipline: 1 (Libre)');
  console.log('- punten_sys: 1 (WRV 2-1-0)');
  console.log('- moy_form: 3 (x3 multiplier)');
  console.log('- min_car: 0 (no minimum required)');
  console.log('- max_beurten: 0 (unlimited turns)');
  console.log('- vast_beurten: 0 (No)');
  console.log('- sorteren: 1 (First name first)');
  process.exit(0);
} else {
  console.log('❌ SOME TESTS FAILED - Review implementation');
  process.exit(1);
}

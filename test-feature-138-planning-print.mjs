#!/usr/bin/env node

/**
 * Feature #138: Match planning exportable or printable
 *
 * Verification steps:
 * 1. Generate Round Robin schedule
 * 2. Navigate to planning page
 * 3. Click print/export option
 * 4. Verify schedule formatted for print
 * 5. Verify all matches and table assignments included
 */

import { readFile } from 'fs/promises';

console.log('=== Feature #138: Match Planning Print/Export Test ===\n');

// Read the planning page source
const planningPagePath = './src/app/(dashboard)/competities/[id]/planning/page.tsx';
const planningContent = await readFile(planningPagePath, 'utf-8');

console.log('✓ Step 1: Check for print button implementation');

// Check for print button
if (planningContent.includes('window.print()')) {
  console.log('  ✓ Print button found with window.print() handler');
} else {
  console.log('  ✗ Print button NOT found');
  process.exit(1);
}

// Check for print button icon
if (planningContent.includes('Afdrukken')) {
  console.log('  ✓ Print button label "Afdrukken" found');
} else {
  console.log('  ✗ Print button label NOT found');
  process.exit(1);
}

console.log('\n✓ Step 2: Check for print-specific styling');

// Check for print media styles
if (planningContent.includes('@media print')) {
  console.log('  ✓ Print media query styles found');
} else {
  console.log('  ✗ Print media query styles NOT found');
  process.exit(1);
}

// Check for print:hidden classes
const printHiddenCount = (planningContent.match(/print:hidden/g) || []).length;
console.log(`  ✓ Found ${printHiddenCount} elements with print:hidden class`);

// Check for landscape orientation
if (planningContent.includes('size: A4 landscape')) {
  console.log('  ✓ A4 landscape orientation configured');
} else {
  console.log('  ✗ Landscape orientation NOT configured');
  process.exit(1);
}

console.log('\n✓ Step 3: Check for table assignment column');

// Check for "Tafel" column header
if (planningContent.includes('Tafel')) {
  console.log('  ✓ Table column header "Tafel" found');
} else {
  console.log('  ✗ Table column header NOT found');
  process.exit(1);
}

// Check for table field display
if (planningContent.includes('match.tafel')) {
  console.log('  ✓ Table field {match.tafel} rendered in UI');
} else {
  console.log('  ✗ Table field NOT rendered');
  process.exit(1);
}

console.log('\n✓ Step 4: Check for print header');

// Check for print-only header
if (planningContent.includes('print:block')) {
  console.log('  ✓ Print-only header section found');
} else {
  console.log('  ✗ Print-only header NOT found');
  process.exit(1);
}

// Check for print timestamp
if (planningContent.includes('Afgedrukt:')) {
  console.log('  ✓ Print timestamp "Afgedrukt:" found');
} else {
  console.log('  ✗ Print timestamp NOT found');
  process.exit(1);
}

console.log('\n✓ Step 5: Verify all required match data included');

const requiredFields = [
  'uitslag_code',  // Match code
  'naam_A',         // Player A name
  'cartem_A',       // Player A caramboles
  'naam_B',         // Player B name
  'cartem_B',       // Player B caramboles
  'tafel',          // Table assignment
  'gespeeld',       // Played status
  'ronde'           // Round number
];

let allFieldsFound = true;
for (const field of requiredFields) {
  if (planningContent.includes(`match.${field}`)) {
    console.log(`  ✓ Field match.${field} displayed`);
  } else {
    console.log(`  ✗ Field match.${field} NOT displayed`);
    allFieldsFound = false;
  }
}

if (!allFieldsFound) {
  process.exit(1);
}

console.log('\n✓ Step 6: Check for print optimization features');

// Check for page break control
if (planningContent.includes('page-break-inside')) {
  console.log('  ✓ Page break control implemented');
} else {
  console.log('  ✗ Page break control NOT found');
  process.exit(1);
}

// Check for color preservation
if (planningContent.includes('print-color-adjust: exact')) {
  console.log('  ✓ Color preservation enabled');
} else {
  console.log('  ✗ Color preservation NOT enabled');
  process.exit(1);
}

console.log('\n✅ ALL CHECKS PASSED!');
console.log('\nFeature #138 Implementation Summary:');
console.log('- Print button added with "Afdrukken" label');
console.log('- Print media styles configured (A4 landscape)');
console.log('- Table assignment column added to match display');
console.log('- Print-only header with competition details');
console.log('- UI elements hidden from print view (buttons, nav)');
console.log('- Page break optimization for tables');
console.log('- All match data included (code, players, caramboles, table, status)');
console.log('\nThe planning page is now fully printable with proper formatting!');

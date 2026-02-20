#!/usr/bin/env node

/**
 * Test Feature #220: Label 'Minimale caramboles' changed to 'Minimaal aantal te maken caramboles'
 * and max value limited to 10
 */

import { readFile } from 'fs/promises';

async function testFeature220() {
  console.log('\n=== Testing Feature #220 ===\n');

  // Test 1: Check nieuw/page.tsx has correct label and max value
  const nieuwPage = await readFile('./src/app/(dashboard)/competities/nieuw/page.tsx', 'utf-8');

  const hasCorrectLabel = nieuwPage.includes('Minimaal aantal te maken caramboles');
  const hasOldLabel = nieuwPage.includes('Minimale caramboles');
  const hasMaxTen = nieuwPage.match(/name="min_car"[\s\S]{0,200}max="10"/);

  console.log('✓ File: src/app/(dashboard)/competities/nieuw/page.tsx');
  console.log(`  ${hasCorrectLabel ? '✓' : '✗'} Has new label: "Minimaal aantal te maken caramboles"`);
  console.log(`  ${!hasOldLabel ? '✓' : '✗'} Old label removed: "Minimale caramboles"`);
  console.log(`  ${hasMaxTen ? '✓' : '✗'} Has max="10" validation`);

  // Test 2: Check bewerken/page.tsx has correct label and max value
  const bewerkenPage = await readFile('./src/app/(dashboard)/competities/[id]/bewerken/page.tsx', 'utf-8');

  const hasCorrectLabel2 = bewerkenPage.includes('Minimaal aantal te maken caramboles');
  const hasOldLabel2 = bewerkenPage.includes('Minimale caramboles');
  const hasMaxTen2 = bewerkenPage.match(/name="min_car"[\s\S]{0,200}max="10"/);

  console.log('\n✓ File: src/app/(dashboard)/competities/[id]/bewerken/page.tsx');
  console.log(`  ${hasCorrectLabel2 ? '✓' : '✗'} Has new label: "Minimaal aantal te maken caramboles"`);
  console.log(`  ${!hasOldLabel2 ? '✓' : '✗'} Old label removed: "Minimale caramboles"`);
  console.log(`  ${hasMaxTen2 ? '✓' : '✗'} Has max="10" validation`);

  const allPassed = hasCorrectLabel && !hasOldLabel && hasMaxTen &&
                    hasCorrectLabel2 && !hasOldLabel2 && hasMaxTen2;

  console.log(`\n${allPassed ? '✓ Feature #220: PASSED' : '✗ Feature #220: FAILED'}\n`);

  return allPassed;
}

testFeature220().then(passed => {
  process.exit(passed ? 0 : 1);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

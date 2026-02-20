#!/usr/bin/env node

/**
 * Test Feature #224: Label 'Formule' consistently changed to 'Moyenne-formule'
 */

import { readFile } from 'fs/promises';

async function testFeature224() {
  console.log('\n=== Testing Feature #224 ===\n');

  const files = [
    './src/app/(dashboard)/competities/[id]/page.tsx',
    './src/app/(dashboard)/competities/nieuw/page.tsx',
    './src/app/(dashboard)/competities/[id]/bewerken/page.tsx'
  ];

  let allPassed = true;

  for (const filePath of files) {
    const content = await readFile(filePath, 'utf-8');

    const hasNewLabel = content.includes('Moyenne-formule');
    const hasOldFormule = content.match(/>\s*Formule\s*</);
    const hasOldMoyenneSpace = content.includes('Moyenne formule');

    console.log(`✓ File: ${filePath.replace('./src/app/(dashboard)/', '')}`);
    console.log(`  ${hasNewLabel ? '✓' : '✗'} Has "Moyenne-formule" label`);
    console.log(`  ${!hasOldFormule ? '✓' : '✗'} Old "Formule" label removed`);
    console.log(`  ${!hasOldMoyenneSpace ? '✓' : '✗'} Old "Moyenne formule" (with space) removed`);

    if (!hasNewLabel || hasOldFormule || hasOldMoyenneSpace) {
      allPassed = false;
    }
    console.log('');
  }

  console.log(`${allPassed ? '✓ Feature #224: PASSED' : '✗ Feature #224: FAILED'}\n`);

  return allPassed;
}

testFeature224().then(passed => {
  process.exit(passed ? 0 : 1);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

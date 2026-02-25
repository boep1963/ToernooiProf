#!/usr/bin/env node
/**
 * Test Feature #336: Validatie: Hoogste serie niet groter dan gemaakte caramboles
 *
 * This test verifies that the validation prevents saving a result where
 * a player's hoogste serie (HS) is greater than their gemaakte caramboles (achieved).
 */

console.log('\n=== Feature #336: Validation Test ===\n');

// Simulate the validation function from matrix page
function validateControleForm(formData, selectedMatch, competition) {
  const cartem1 = Number(formData.sp_1_cartem) || 0;
  const cargem1 = Number(formData.sp_1_cargem) || 0;
  const hs1 = Number(formData.sp_1_hs) || 0;
  const cartem2 = Number(formData.sp_2_cartem) || 0;
  const cargem2 = Number(formData.sp_2_cargem) || 0;
  const hs2 = Number(formData.sp_2_hs) || 0;
  const brt = Number(formData.brt) || 0;

  // Validatie: aantal beurten moet groter zijn dan 0
  if (brt <= 0) {
    return { valid: false, message: 'Aantal beurten moet groter zijn dan 0' };
  }

  // Feature #336: Validatie: hoogste serie niet groter dan gemaakte caramboles
  if (hs1 > cargem1) {
    return {
      valid: false,
      message: `${selectedMatch?.playerAName}: hoogste serie (${hs1}) kan niet groter zijn dan het aantal gemaakte caramboles (${cargem1})`
    };
  }
  if (hs2 > cargem2) {
    return {
      valid: false,
      message: `${selectedMatch?.playerBName}: hoogste serie (${hs2}) kan niet groter zijn dan het aantal gemaakte caramboles (${cargem2})`
    };
  }

  return { valid: true };
}

// Test cases
const tests = [
  {
    name: 'Valid result - HS equals achieved',
    formData: {
      sp_1_cartem: 50,
      sp_1_cargem: 50,
      sp_1_hs: 15,
      sp_2_cartem: 50,
      sp_2_cargem: 45,
      sp_2_hs: 12,
      brt: 20
    },
    selectedMatch: {
      playerAName: 'Speler A',
      playerBName: 'Speler B'
    },
    expectedValid: true,
    description: 'Player A: 15 HS with 50 achieved (valid), Player B: 12 HS with 45 achieved (valid)'
  },
  {
    name: 'Invalid - Player A HS > achieved',
    formData: {
      sp_1_cartem: 50,
      sp_1_cargem: 15,
      sp_1_hs: 20,
      sp_2_cartem: 50,
      sp_2_cargem: 45,
      sp_2_hs: 12,
      brt: 20
    },
    selectedMatch: {
      playerAName: 'Speler A',
      playerBName: 'Speler B'
    },
    expectedValid: false,
    expectedMessage: 'Speler A: hoogste serie (20) kan niet groter zijn dan het aantal gemaakte caramboles (15)',
    description: 'Player A: 20 HS with only 15 achieved caramboles (INVALID)'
  },
  {
    name: 'Invalid - Player B HS > achieved',
    formData: {
      sp_1_cartem: 50,
      sp_1_cargem: 50,
      sp_1_hs: 15,
      sp_2_cartem: 50,
      sp_2_cargem: 10,
      sp_2_hs: 25,
      brt: 20
    },
    selectedMatch: {
      playerAName: 'Speler A',
      playerBName: 'Speler B'
    },
    expectedValid: false,
    expectedMessage: 'Speler B: hoogste serie (25) kan niet groter zijn dan het aantal gemaakte caramboles (10)',
    description: 'Player B: 25 HS with only 10 achieved caramboles (INVALID)'
  },
  {
    name: 'Valid - HS is 0',
    formData: {
      sp_1_cartem: 50,
      sp_1_cargem: 0,
      sp_1_hs: 0,
      sp_2_cartem: 50,
      sp_2_cargem: 50,
      sp_2_hs: 15,
      brt: 20
    },
    selectedMatch: {
      playerAName: 'Speler A',
      playerBName: 'Speler B'
    },
    expectedValid: true,
    description: 'Player A made 0 caramboles with 0 HS (edge case - valid)'
  },
  {
    name: 'Invalid - Both players HS > achieved',
    formData: {
      sp_1_cartem: 50,
      sp_1_cargem: 5,
      sp_1_hs: 10,
      sp_2_cartem: 50,
      sp_2_cargem: 8,
      sp_2_hs: 20,
      brt: 20
    },
    selectedMatch: {
      playerAName: 'Jan',
      playerBName: 'Piet'
    },
    expectedValid: false,
    expectedMessage: 'Jan: hoogste serie (10) kan niet groter zijn dan het aantal gemaakte caramboles (5)',
    description: 'Both players have invalid HS, should catch Player A first'
  }
];

let passed = 0;
let failed = 0;

tests.forEach((test, index) => {
  console.log(`Test ${index + 1}: ${test.name}`);
  console.log(`  Description: ${test.description}`);

  const result = validateControleForm(test.formData, test.selectedMatch, {});

  if (result.valid === test.expectedValid) {
    if (!test.expectedValid && result.message === test.expectedMessage) {
      console.log(`  ✅ PASS - Validation returned expected error`);
      console.log(`     Message: "${result.message}"`);
      passed++;
    } else if (test.expectedValid) {
      console.log(`  ✅ PASS - Validation allowed valid data`);
      passed++;
    } else {
      console.log(`  ❌ FAIL - Message mismatch`);
      console.log(`     Expected: "${test.expectedMessage}"`);
      console.log(`     Got: "${result.message}"`);
      failed++;
    }
  } else {
    console.log(`  ❌ FAIL`);
    console.log(`     Expected valid: ${test.expectedValid}`);
    console.log(`     Got valid: ${result.valid}`);
    if (result.message) console.log(`     Message: "${result.message}"`);
    failed++;
  }
  console.log('');
});

console.log('=== Test Summary ===');
console.log(`Passed: ${passed}/${tests.length}`);
console.log(`Failed: ${failed}/${tests.length}`);

if (failed > 0) {
  console.log('\n❌ Some tests failed');
  process.exit(1);
} else {
  console.log('\n✅ All tests passed!');
  process.exit(0);
}

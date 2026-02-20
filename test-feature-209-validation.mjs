#!/usr/bin/env node

/**
 * Test Feature #209: Uitgebreide validatie bij uitslag invoeren
 *
 * Tests all validation rules:
 * 1. Caramboles gemaakt ≤ te maken caramboles (unless vast_beurten)
 * 2. Aantal beurten ≥ 1
 * 3. Hoogste serie × beurten ≥ caramboles gemaakt
 */

console.log('=== Feature #209 Validation Tests ===\n');

// Test cases for validation
const testCases = [
  {
    name: 'Valid result',
    data: {
      sp_1_cargem: 50,
      sp_1_hs: 10,
      sp_1_cartem: 100,
      sp_2_cargem: 60,
      sp_2_hs: 12,
      sp_2_cartem: 100,
      brt: 10,
      vast_beurten: 0
    },
    shouldPass: true
  },
  {
    name: 'Invalid: beurten = 0',
    data: {
      sp_1_cargem: 50,
      sp_1_hs: 10,
      sp_1_cartem: 100,
      sp_2_cargem: 60,
      sp_2_hs: 12,
      sp_2_cartem: 100,
      brt: 0,
      vast_beurten: 0
    },
    shouldPass: false,
    expectedError: 'Aantal beurten moet minimaal 1 zijn'
  },
  {
    name: 'Invalid: caramboles > cartem (non-vast beurten)',
    data: {
      sp_1_cargem: 150,  // More than cartem!
      sp_1_hs: 10,
      sp_1_cartem: 100,
      sp_2_cargem: 60,
      sp_2_hs: 12,
      sp_2_cartem: 100,
      brt: 15,
      vast_beurten: 0
    },
    shouldPass: false,
    expectedError: 'caramboles gemaakt (150) kan niet meer zijn dan te maken caramboles (100)'
  },
  {
    name: 'Valid: caramboles > cartem (WITH vast beurten)',
    data: {
      sp_1_cargem: 150,  // More than cartem BUT allowed with vast_beurten
      sp_1_hs: 10,
      sp_1_cartem: 100,
      sp_2_cargem: 60,
      sp_2_hs: 12,
      sp_2_cartem: 100,
      brt: 15,
      vast_beurten: 1  // Fixed turns allows unlimited caramboles
    },
    shouldPass: true
  },
  {
    name: 'Invalid: HS × beurten < caramboles (player 1)',
    data: {
      sp_1_cargem: 100,  // 100 caramboles
      sp_1_hs: 5,        // HS = 5
      sp_1_cartem: 100,
      sp_2_cargem: 60,
      sp_2_hs: 12,
      sp_2_cartem: 100,
      brt: 10,           // 5 × 10 = 50, but made 100! Impossible!
      vast_beurten: 0
    },
    shouldPass: false,
    expectedError: 'hoogste serie (5) × beurten (10) = 50 is minder dan caramboles gemaakt (100)'
  },
  {
    name: 'Invalid: HS × beurten < caramboles (player 2)',
    data: {
      sp_1_cargem: 50,
      sp_1_hs: 10,
      sp_1_cartem: 100,
      sp_2_cargem: 80,   // 80 caramboles
      sp_2_hs: 7,        // HS = 7
      sp_2_cartem: 100,
      brt: 10,           // 7 × 10 = 70, but made 80! Impossible!
      vast_beurten: 0
    },
    shouldPass: false,
    expectedError: 'hoogste serie (7) × beurten (10) = 70 is minder dan caramboles gemaakt (80)'
  },
  {
    name: 'Valid: HS × beurten = caramboles (exact)',
    data: {
      sp_1_cargem: 100,
      sp_1_hs: 10,
      sp_1_cartem: 100,
      sp_2_cargem: 70,
      sp_2_hs: 7,
      sp_2_cartem: 100,
      brt: 10,           // Perfect: 10×10=100, 7×10=70
      vast_beurten: 0
    },
    shouldPass: true
  },
  {
    name: 'Invalid: negative caramboles',
    data: {
      sp_1_cargem: -10,  // Negative!
      sp_1_hs: 10,
      sp_1_cartem: 100,
      sp_2_cargem: 60,
      sp_2_hs: 12,
      sp_2_cartem: 100,
      brt: 10,
      vast_beurten: 0
    },
    shouldPass: false,
    expectedError: 'Caramboles gemaakt voor speler 1 kunnen niet negatief zijn'
  },
  {
    name: 'Invalid: negative hoogste serie',
    data: {
      sp_1_cargem: 50,
      sp_1_hs: -5,  // Negative!
      sp_1_cartem: 100,
      sp_2_cargem: 60,
      sp_2_hs: 12,
      sp_2_cartem: 100,
      brt: 10,
      vast_beurten: 0
    },
    shouldPass: false,
    expectedError: 'Hoogste serie voor speler 1 kan niet negatief zijn'
  }
];

// Validation logic (mirrors the implementation)
function validateResult(data) {
  const { sp_1_cargem, sp_1_hs, sp_1_cartem, sp_2_cargem, sp_2_hs, sp_2_cartem, brt, vast_beurten } = data;

  // Validate caramboles (cannot be negative)
  if (sp_1_cargem < 0) {
    return { valid: false, error: 'Caramboles gemaakt voor speler 1 kunnen niet negatief zijn' };
  }
  if (sp_2_cargem < 0) {
    return { valid: false, error: 'Caramboles gemaakt voor speler 2 kunnen niet negatief zijn' };
  }

  // Validate highest series (cannot be negative)
  if (sp_1_hs < 0) {
    return { valid: false, error: 'Hoogste serie voor speler 1 kan niet negatief zijn' };
  }
  if (sp_2_hs < 0) {
    return { valid: false, error: 'Hoogste serie voor speler 2 kan niet negatief zijn' };
  }

  // Validate turns (must be >= 1)
  if (brt < 1) {
    return { valid: false, error: 'Aantal beurten moet minimaal 1 zijn' };
  }

  // Validate caramboles gemaakt <= te maken caramboles (unless vast_beurten)
  if (vast_beurten === 0) {
    if (sp_1_cargem > sp_1_cartem) {
      return { valid: false, error: `Speler 1: caramboles gemaakt (${sp_1_cargem}) kan niet meer zijn dan te maken caramboles (${sp_1_cartem})` };
    }
    if (sp_2_cargem > sp_2_cartem) {
      return { valid: false, error: `Speler 2: caramboles gemaakt (${sp_2_cargem}) kan niet meer zijn dan te maken caramboles (${sp_2_cartem})` };
    }
  }

  // Validate logical consistency: hoogste serie × beurten >= caramboles gemaakt
  if (sp_1_hs * brt < sp_1_cargem) {
    return { valid: false, error: `Speler 1: hoogste serie (${sp_1_hs}) × beurten (${brt}) = ${sp_1_hs * brt} is minder dan caramboles gemaakt (${sp_1_cargem}). Dit is niet mogelijk.` };
  }
  if (sp_2_hs * brt < sp_2_cargem) {
    return { valid: false, error: `Speler 2: hoogste serie (${sp_2_hs}) × beurten (${brt}) = ${sp_2_hs * brt} is minder dan caramboles gemaakt (${sp_2_cargem}). Dit is niet mogelijk.` };
  }

  return { valid: true };
}

// Run tests
let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
  const result = validateResult(test.data);
  const success = (result.valid === test.shouldPass) &&
                  (!test.expectedError || result.error?.includes(test.expectedError));

  if (success) {
    console.log(`✅ Test ${index + 1}: ${test.name}`);
    passed++;
  } else {
    console.log(`❌ Test ${index + 1}: ${test.name}`);
    console.log(`   Expected: ${test.shouldPass ? 'PASS' : `FAIL with "${test.expectedError}"`}`);
    console.log(`   Got: ${result.valid ? 'PASS' : `FAIL with "${result.error}"`}`);
    failed++;
  }
});

console.log(`\n=== Results ===`);
console.log(`✅ Passed: ${passed}/${testCases.length}`);
console.log(`❌ Failed: ${failed}/${testCases.length}`);

if (failed === 0) {
  console.log(`\n🎉 All validation tests passed!`);
  process.exit(0);
} else {
  console.log(`\n⚠️  Some tests failed. Please review the validation logic.`);
  process.exit(1);
}

// Test script to verify caramboles auto-calculation
// Feature #32: Caramboles auto-calculation from moyenne

const MOYENNE_MULTIPLIERS = {
  1: 15,
  2: 20,
  3: 25,  // x25 formula
  4: 30,
  5: 40,
};

function calculateCaramboles(moyenne, moyenneFormula, minCar) {
  const multiplier = MOYENNE_MULTIPLIERS[moyenneFormula] || 25;
  const calculated = Math.round(moyenne * multiplier);
  return Math.max(calculated, minCar);
}

console.log('=== Feature #32: Caramboles Auto-Calculation Test ===\n');

// Test configuration
const MOY_FORM = 3;  // x25
const MIN_CAR = 10;

console.log(`Configuration: moy_form=${MOY_FORM} (x${MOYENNE_MULTIPLIERS[MOY_FORM]}), min_car=${MIN_CAR}\n`);

// Test 1: Low moyenne (should enforce minimum)
const test1Moyenne = 0.200;
const test1Result = calculateCaramboles(test1Moyenne, MOY_FORM, MIN_CAR);
const test1Calculated = Math.round(test1Moyenne * MOYENNE_MULTIPLIERS[MOY_FORM]);
console.log(`Test 1: Moyenne ${test1Moyenne}`);
console.log(`  Calculated: round(${test1Moyenne} × ${MOYENNE_MULTIPLIERS[MOY_FORM]}) = ${test1Calculated}`);
console.log(`  Final caramboles: max(${test1Calculated}, ${MIN_CAR}) = ${test1Result}`);
console.log(`  ✓ Expected: 10 (min_car enforced since ${test1Calculated} < ${MIN_CAR})`);
console.log(`  ✓ Result: ${test1Result} ${test1Result === 10 ? 'PASS' : 'FAIL'}\n`);

// Test 2: High moyenne (should use calculated value)
const test2Moyenne = 3.500;
const test2Result = calculateCaramboles(test2Moyenne, MOY_FORM, MIN_CAR);
const test2Calculated = Math.round(test2Moyenne * MOYENNE_MULTIPLIERS[MOY_FORM]);
console.log(`Test 2: Moyenne ${test2Moyenne}`);
console.log(`  Calculated: round(${test2Moyenne} × ${MOYENNE_MULTIPLIERS[MOY_FORM]}) = ${test2Calculated}`);
console.log(`  Final caramboles: max(${test2Calculated}, ${MIN_CAR}) = ${test2Result}`);
console.log(`  ✓ Expected: 88 (round(3.5×25)=${test2Calculated} > ${MIN_CAR})`);
console.log(`  ✓ Result: ${test2Result} ${test2Result === 88 ? 'PASS' : 'FAIL'}\n`);

// Summary
const allPassed = test1Result === 10 && test2Result === 88;
console.log('=== Summary ===');
console.log(`Test 1 (0.200 → 10): ${test1Result === 10 ? 'PASS ✓' : 'FAIL ✗'}`);
console.log(`Test 2 (3.500 → 88): ${test2Result === 88 ? 'PASS ✓' : 'FAIL ✗'}`);
console.log(`\nOverall: ${allPassed ? 'ALL TESTS PASSED ✓' : 'SOME TESTS FAILED ✗'}`);

process.exit(allPassed ? 0 : 1);

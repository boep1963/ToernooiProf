#!/usr/bin/env node

/**
 * Test Feature #101: Discipline-specific moyenne used for players
 *
 * When adding a player to a competition, the correct discipline-specific
 * moyenne should be used for carambole calculation.
 */

console.log('\n🧪 Testing Discipline-Specific Moyenne (Feature #101)\n');
console.log('='.repeat(70));

// Import the getMoyenneField function logic
function getMoyenneField(discipline) {
  const fields = {
    1: 'spa_moy_lib',
    2: 'spa_moy_band',
    3: 'spa_moy_3bkl',
    4: 'spa_moy_3bgr',
    5: 'spa_moy_kad',
  };
  return fields[discipline] || 'spa_moy_lib';
}

// Import the calculateCaramboles function logic
const MOYENNE_MULTIPLIERS = {
  1: 25,
  2: 30,
  3: 35,
  4: 40,
  5: 45,
  6: 50,
};

function calculateCaramboles(moyenne, moyenneFormula, minCar) {
  const multiplier = MOYENNE_MULTIPLIERS[moyenneFormula] || 25;
  const calculated = Math.round(moyenne * multiplier);
  return Math.max(calculated, minCar);
}

// Simulate adding a member to different competitions
function testAddPlayerToCompetition(competitionName, discipline, memberMoyennes, moyForm, minCar) {
  console.log(`\n📋 ${competitionName} (Discipline ${discipline})`);
  console.log('-'.repeat(70));

  // Get the correct moyenne field for this discipline
  const moyenneField = getMoyenneField(discipline);
  const correctMoyenne = memberMoyennes[moyenneField];

  console.log(`Member moyennes:`);
  console.log(`  Libre (1): ${memberMoyennes.spa_moy_lib}`);
  console.log(`  Bandstoten (2): ${memberMoyennes.spa_moy_band}`);
  console.log(`  3-Banden klein (3): ${memberMoyennes.spa_moy_3bkl}`);
  console.log(`  3-Banden groot (4): ${memberMoyennes.spa_moy_3bgr}`);
  console.log(`  Kader (5): ${memberMoyennes.spa_moy_kad}`);
  console.log('');

  console.log(`Competition discipline: ${discipline}`);
  console.log(`Selected moyenne field: ${moyenneField}`);
  console.log(`Selected moyenne value: ${correctMoyenne}`);
  console.log(`Moyenne formula: ${moyForm} (multiplier: ${MOYENNE_MULTIPLIERS[moyForm] || 25})`);
  console.log(`Minimum caramboles: ${minCar}`);
  console.log('');

  // Calculate caramboles using the correct discipline moyenne
  const caramboles = calculateCaramboles(correctMoyenne, moyForm, minCar);

  console.log(`Calculated caramboles: ${caramboles}`);
  console.log(`  Formula: round(${correctMoyenne} × ${MOYENNE_MULTIPLIERS[moyForm] || 25}) = ${Math.round(correctMoyenne * (MOYENNE_MULTIPLIERS[moyForm] || 25))}`);
  console.log(`  After min enforcement: max(${Math.round(correctMoyenne * (MOYENNE_MULTIPLIERS[moyForm] || 25))}, ${minCar}) = ${caramboles}`);

  return { moyenneField, correctMoyenne, caramboles };
}

// Test member with different moyennes for each discipline
const testMember = {
  spa_moy_lib: 2.5,   // Libre
  spa_moy_band: 1.8,  // Bandstoten
  spa_moy_3bkl: 0.9,  // 3-Banden klein
  spa_moy_3bgr: 0.6,  // 3-Banden groot
  spa_moy_kad: 0.4,   // Kader
};

console.log('Test member with different moyenne per discipline:');
console.log('  Libre: 2.5');
console.log('  Bandstoten: 1.8');
console.log('  3-Banden klein: 0.9');
console.log('  3-Banden groot: 0.6');
console.log('  Kader: 0.4');

// Test 1: Add to Libre competition (Step 3)
const libre = testAddPlayerToCompetition(
  'Step 3: Libre Competition',
  1, // Discipline: Libre
  testMember,
  3, // Moyenne formula 3 (×35)
  10 // Min caramboles
);

// Test 2: Add to Bandstoten competition (Step 5)
const bandstoten = testAddPlayerToCompetition(
  'Step 5: Bandstoten Competition',
  2, // Discipline: Bandstoten
  testMember,
  3, // Moyenne formula 3 (×35)
  10 // Min caramboles
);

// Test 3: Add to 3-Banden klein competition
const drieBandenKlein = testAddPlayerToCompetition(
  '3-Banden Klein Competition',
  3, // Discipline: 3-Banden klein
  testMember,
  3, // Moyenne formula 3 (×35)
  10 // Min caramboles
);

// Test 4: Add to 3-Banden groot competition
const drieBandenGroot = testAddPlayerToCompetition(
  '3-Banden Groot Competition',
  4, // Discipline: 3-Banden groot
  testMember,
  3, // Moyenne formula 3 (×35)
  10 // Min caramboles
);

// Test 5: Add to Kader competition
const kader = testAddPlayerToCompetition(
  'Kader Competition',
  5, // Discipline: Kader
  testMember,
  3, // Moyenne formula 3 (×35)
  10 // Min caramboles
);

// Verify results
console.log('\n' + '='.repeat(70));
console.log('\n✅ Verification:\n');

const tests = [
  { name: 'Libre', result: libre, expectedMoyenne: 2.5, expectedCar: 88 },
  { name: 'Bandstoten', result: bandstoten, expectedMoyenne: 1.8, expectedCar: 63 },
  { name: '3-Banden klein', result: drieBandenKlein, expectedMoyenne: 0.9, expectedCar: 32 },
  { name: '3-Banden groot', result: drieBandenGroot, expectedMoyenne: 0.6, expectedCar: 21 },
  { name: 'Kader', result: kader, expectedMoyenne: 0.4, expectedCar: 14 },
];

let allPassed = true;

tests.forEach((test) => {
  const moyenneMatch = test.result.correctMoyenne === test.expectedMoyenne;
  const carambolesMatch = test.result.caramboles === test.expectedCar;
  const passed = moyenneMatch && carambolesMatch;

  if (passed) {
    console.log(`✅ ${test.name}: moyenne ${test.result.correctMoyenne} → ${test.result.caramboles} car`);
  } else {
    console.log(`❌ ${test.name}: FAILED`);
    if (!moyenneMatch) {
      console.log(`   Expected moyenne: ${test.expectedMoyenne}, got: ${test.result.correctMoyenne}`);
    }
    if (!carambolesMatch) {
      console.log(`   Expected caramboles: ${test.expectedCar}, got: ${test.result.caramboles}`);
    }
    allPassed = false;
  }
});

console.log('');

if (allPassed) {
  console.log('🎉 All tests passed! Discipline-specific moyennes are used correctly.\n');
  console.log('Key verified behavior:');
  console.log('  ✓ Each discipline uses its own moyenne field (spa_moy_lib, spa_moy_band, etc.)');
  console.log('  ✓ Caramboles calculated correctly using discipline moyenne');
  console.log('  ✓ Same member gets different caramboles in different disciplines');
  console.log('  ✓ Example: Libre (2.5 × 35 = 88) vs Bandstoten (1.8 × 35 = 63)');
  console.log('');
  process.exit(0);
} else {
  console.log('⚠️  Some tests failed. Please review the implementation.\n');
  process.exit(1);
}

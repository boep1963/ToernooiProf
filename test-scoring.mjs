#!/usr/bin/env node

/**
 * Test scoring calculation functions
 * Tests features #39 (10-point) and #40 (Belgian)
 */

// Copy of calculate10PointScore from billiards.ts
function calculate10PointScore(carambolesGemaakt, carambolesTeMaken) {
  if (carambolesTeMaken <= 0) return 0;
  return Math.min(Math.floor((carambolesGemaakt / carambolesTeMaken) * 10), 10);
}

// Copy of calculateBelgianScore from billiards.ts
function calculateBelgianScore(player1Gem, player1Tem, player2Gem, player2Tem) {
  const score1 = calculate10PointScore(player1Gem, player1Tem);
  const score2 = calculate10PointScore(player2Gem, player2Tem);

  if (score1 >= 10 && score2 >= 10) {
    // Both reached max: draw at 11
    return { points1: 11, points2: 11 };
  } else if (score1 >= 10) {
    // Player 1 wins with 12
    return { points1: 12, points2: score2 };
  } else if (score2 >= 10) {
    // Player 2 wins with 12
    return { points1: score1, points2: 12 };
  }

  return { points1: score1, points2: score2 };
}

console.log('=== Testing 10-Point Scoring System (Feature #39) ===\n');

// Test case 1: 20 made, 25 target → should be 8 points
const test1 = calculate10PointScore(20, 25);
console.log(`Test 1: 20 made / 25 target = ${test1} points (expected: 8)`);
console.log(`  Calculation: floor(20/25 * 10) = floor(0.8 * 10) = floor(8.0) = 8`);
console.log(`  ✓ ${test1 === 8 ? 'PASS' : 'FAIL'}\n`);

// Test case 2: 25 made, 25 target → should be 10 points
const test2 = calculate10PointScore(25, 25);
console.log(`Test 2: 25 made / 25 target = ${test2} points (expected: 10)`);
console.log(`  Calculation: floor(25/25 * 10) = floor(1.0 * 10) = floor(10.0) = 10`);
console.log(`  ✓ ${test2 === 10 ? 'PASS' : 'FAIL'}\n`);

// Test case 3: 7 made, 30 target → should be 2 points
const test3 = calculate10PointScore(7, 30);
console.log(`Test 3: 7 made / 30 target = ${test3} points (expected: 2)`);
console.log(`  Calculation: floor(7/30 * 10) = floor(0.233 * 10) = floor(2.33) = 2`);
console.log(`  ✓ ${test3 === 2 ? 'PASS' : 'FAIL'}\n`);

// Test case 4: Over-achievement capped at 10
const test4 = calculate10PointScore(30, 25);
console.log(`Test 4: 30 made / 25 target = ${test4} points (expected: 10, capped)`);
console.log(`  Calculation: min(floor(30/25 * 10), 10) = min(12, 10) = 10`);
console.log(`  ✓ ${test4 === 10 ? 'PASS' : 'FAIL'}\n`);

console.log('\n=== Testing Belgian Scoring System (Feature #40) ===\n');

// Test case 1: Player 1 reaches target, Player 2 doesn't → P1=12, P2=score
const belgian1 = calculateBelgianScore(25, 25, 20, 25);
console.log(`Test 1: P1 reaches max (25/25), P2 doesn't (20/25)`);
console.log(`  P1 score: ${belgian1.points1} (expected: 12)`);
console.log(`  P2 score: ${belgian1.points2} (expected: 8)`);
console.log(`  ✓ ${belgian1.points1 === 12 && belgian1.points2 === 8 ? 'PASS' : 'FAIL'}\n`);

// Test case 2: Both reach target → 11 each
const belgian2 = calculateBelgianScore(25, 25, 30, 30);
console.log(`Test 2: Both reach max (25/25 and 30/30)`);
console.log(`  P1 score: ${belgian2.points1} (expected: 11)`);
console.log(`  P2 score: ${belgian2.points2} (expected: 11)`);
console.log(`  ✓ ${belgian2.points1 === 11 && belgian2.points2 === 11 ? 'PASS' : 'FAIL'}\n`);

// Test case 3: Player 2 reaches target, Player 1 doesn't → P1=score, P2=12
const belgian3 = calculateBelgianScore(15, 25, 30, 30);
console.log(`Test 3: P1 doesn't reach (15/25), P2 reaches max (30/30)`);
console.log(`  P1 score: ${belgian3.points1} (expected: 6)`);
console.log(`  P2 score: ${belgian3.points2} (expected: 12)`);
console.log(`  ✓ ${belgian3.points1 === 6 && belgian3.points2 === 12 ? 'PASS' : 'FAIL'}\n`);

// Test case 4: Neither reaches target → use 10-point scores
const belgian4 = calculateBelgianScore(15, 25, 20, 30);
console.log(`Test 4: Neither reaches target (15/25 and 20/30)`);
console.log(`  P1 score: ${belgian4.points1} (expected: 6)`);
console.log(`  P2 score: ${belgian4.points2} (expected: 6)`);
console.log(`  ✓ ${belgian4.points1 === 6 && belgian4.points2 === 6 ? 'PASS' : 'FAIL'}\n`);

console.log('\n=== Summary ===');
const allPassed = test1 === 8 && test2 === 10 && test3 === 2 && test4 === 10 &&
                  belgian1.points1 === 12 && belgian1.points2 === 8 &&
                  belgian2.points1 === 11 && belgian2.points2 === 11 &&
                  belgian3.points1 === 6 && belgian3.points2 === 12 &&
                  belgian4.points1 === 6 && belgian4.points2 === 6;

console.log(allPassed ? '✅ All tests PASSED' : '❌ Some tests FAILED');
process.exit(allPassed ? 0 : 1);

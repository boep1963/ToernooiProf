// Test script to verify WRV draw scoring
// Feature #38: WRV draw scoring calculates correctly

function calculateWRVPoints(
  player1Gem,
  player1Tem,
  player2Gem,
  player2Tem,
  maxBeurten,
  beurten,
  vastBeurten,
  puntenSys
) {
  const pct1 = player1Tem > 0 ? (player1Gem / player1Tem) * 100 : 0;
  const pct2 = player2Tem > 0 ? (player2Gem / player2Tem) * 100 : 0;

  const reached1 = player1Gem >= player1Tem;
  const reached2 = player2Gem >= player2Tem;

  let points1 = 0;
  let points2 = 0;

  if (vastBeurten) {
    if (pct1 > pct2) {
      points1 = 2;
      points2 = 0;
    } else if (pct2 > pct1) {
      points1 = 0;
      points2 = 2;
    } else {
      points1 = 1;
      points2 = 1;
    }
  } else if (maxBeurten > 0 && beurten >= maxBeurten && !reached1 && !reached2) {
    if (pct1 > pct2) {
      points1 = 2;
      points2 = 0;
    } else if (pct2 > pct1) {
      points1 = 0;
      points2 = 2;
    } else {
      points1 = 1;
      points2 = 1;
    }
  } else if (reached1 && reached2) {
    // Both reached target: draw
    points1 = 1;
    points2 = 1;
  } else if (reached1 && !reached2) {
    points1 = 2;
    points2 = 0;
  } else if (!reached1 && reached2) {
    points1 = 0;
    points2 = 2;
  } else {
    // Neither reached: compare by percentage
    if (pct1 > pct2) {
      points1 = 2;
      points2 = 0;
    } else if (pct2 > pct1) {
      points1 = 0;
      points2 = 2;
    } else {
      points1 = 1;
      points2 = 1;
    }
  }

  return { points1, points2 };
}

console.log('=== Feature #38: WRV Draw Scoring Test ===\n');

// Test 1: Both players reach target
console.log('Test 1: Both players reach target');
const test1 = calculateWRVPoints(100, 100, 100, 100, 30, 20, false, 1);
console.log(`  Player 1: 100/100 (reached), Player 2: 100/100 (reached)`);
console.log(`  Result: P1=${test1.points1}, P2=${test1.points2}`);
console.log(`  Expected: P1=1, P2=1 (draw)`);
console.log(`  ${test1.points1 === 1 && test1.points2 === 1 ? 'PASS ✓' : 'FAIL ✗'}\n`);

// Test 2: Neither reaches but same percentage
console.log('Test 2: Neither reaches but same percentage');
const test2 = calculateWRVPoints(50, 100, 50, 100, 30, 25, false, 1);
console.log(`  Player 1: 50/100 (50%), Player 2: 50/100 (50%)`);
console.log(`  Neither reached target, same percentage`);
console.log(`  Result: P1=${test2.points1}, P2=${test2.points2}`);
console.log(`  Expected: P1=1, P2=1 (draw by percentage)`);
console.log(`  ${test2.points2 === 1 && test2.points2 === 1 ? 'PASS ✓' : 'FAIL ✗'}\n`);

// Test 3: Both reach with different caramboles (still a draw)
console.log('Test 3: Both reach different targets');
const test3 = calculateWRVPoints(120, 100, 80, 75, 30, 22, false, 1);
console.log(`  Player 1: 120/100 (reached), Player 2: 80/75 (reached)`);
console.log(`  Both reached their targets`);
console.log(`  Result: P1=${test3.points1}, P2=${test3.points2}`);
console.log(`  Expected: P1=1, P2=1 (both reached = draw)`);
console.log(`  ${test3.points1 === 1 && test3.points2 === 1 ? 'PASS ✓' : 'FAIL ✗'}\n`);

// Test 4: Fixed turns mode with same percentage
console.log('Test 4: Fixed turns mode with same percentage');
const test4 = calculateWRVPoints(60, 100, 60, 100, 30, 30, true, 1);
console.log(`  Player 1: 60/100 (60%), Player 2: 60/100 (60%)`);
console.log(`  Fixed turns mode, same percentage`);
console.log(`  Result: P1=${test4.points1}, P2=${test4.points2}`);
console.log(`  Expected: P1=1, P2=1 (draw by percentage in fixed mode)`);
console.log(`  ${test4.points1 === 1 && test4.points2 === 1 ? 'PASS ✓' : 'FAIL ✗'}\n`);

const allPassed =
  test1.points1 === 1 && test1.points2 === 1 &&
  test2.points1 === 1 && test2.points2 === 1 &&
  test3.points1 === 1 && test3.points2 === 1 &&
  test4.points1 === 1 && test4.points2 === 1;

console.log('=== Summary ===');
console.log(`Test 1 (both reach): ${test1.points1 === 1 && test1.points2 === 1 ? 'PASS ✓' : 'FAIL ✗'}`);
console.log(`Test 2 (same %): ${test2.points1 === 1 && test2.points2 === 1 ? 'PASS ✓' : 'FAIL ✗'}`);
console.log(`Test 3 (both reach diff targets): ${test3.points1 === 1 && test3.points2 === 1 ? 'PASS ✓' : 'FAIL ✗'}`);
console.log(`Test 4 (fixed turns same %): ${test4.points1 === 1 && test4.points2 === 1 ? 'PASS ✓' : 'FAIL ✗'}`);
console.log(`\nOverall: ${allPassed ? 'ALL TESTS PASSED ✓' : 'SOME TESTS FAILED ✗'}`);

process.exit(allPassed ? 0 : 1);

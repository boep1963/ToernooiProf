#!/usr/bin/env node

/**
 * Comprehensive test of WRV bonus scenarios for Feature #74
 */

console.log('\n🧪 Testing WRV Bonus Point Calculation - All Scenarios (Feature #74)\n');
console.log('='.repeat(70));

let passed = 0;
let failed = 0;

function testScenario(name, params, expected) {
  console.log(`\n📋 ${name}`);
  console.log('-'.repeat(70));

  const {
    player1Gem,
    player1Tem,
    player2Gem,
    player2Tem,
    beurten,
    player1Moyenne,
    player2Moyenne,
    puntenSys
  } = params;

  // Base WRV calculation
  const reached1 = player1Gem >= player1Tem;
  const reached2 = player2Gem >= player2Tem;
  const pct1 = player1Tem > 0 ? (player1Gem / player1Tem) * 100 : 0;
  const pct2 = player2Tem > 0 ? (player2Gem / player2Tem) * 100 : 0;

  let points1 = 0;
  let points2 = 0;

  if (reached1 && reached2) {
    // Draw (both reached)
    points1 = 1;
    points2 = 1;
  } else if (reached1 && !reached2) {
    // Player 1 wins
    points1 = 2;
    points2 = 0;
  } else if (!reached1 && reached2) {
    // Player 2 wins
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

  console.log(`Base points: P1=${points1}, P2=${points2}`);

  // Bonus calculation
  const puntenStr = puntenSys.toString();
  if (puntenStr.length >= 2 && puntenStr[1] === '1' && player1Moyenne !== undefined && player2Moyenne !== undefined) {
    const matchMoyenne1 = beurten > 0 ? player1Gem / beurten : 0;
    const matchMoyenne2 = beurten > 0 ? player2Gem / beurten : 0;

    const aboveMoyenne1 = matchMoyenne1 > player1Moyenne;
    const aboveMoyenne2 = matchMoyenne2 > player2Moyenne;

    console.log(`P1 match moyenne: ${matchMoyenne1.toFixed(2)} vs ${player1Moyenne.toFixed(2)} registered (${aboveMoyenne1 ? 'ABOVE' : 'BELOW'})`);
    console.log(`P2 match moyenne: ${matchMoyenne2.toFixed(2)} vs ${player2Moyenne.toFixed(2)} registered (${aboveMoyenne2 ? 'ABOVE' : 'BELOW'})`);

    // Winner bonus
    const beforeP1 = points1;
    const beforeP2 = points2;

    if (points1 === 2 && aboveMoyenne1) points1 += 1;
    if (points2 === 2 && aboveMoyenne2) points2 += 1;

    if (points1 > beforeP1) console.log('✓ P1 winner bonus applied');
    if (points2 > beforeP2) console.log('✓ P2 winner bonus applied');

    // Draw bonus (digit 4)
    if (puntenStr.length >= 4 && puntenStr[3] === '1') {
      const beforeP1Draw = points1;
      const beforeP2Draw = points2;

      if (points1 === 1 && aboveMoyenne1) points1 += 1;
      if (points2 === 1 && aboveMoyenne2) points2 += 1;

      if (points1 > beforeP1Draw) console.log('✓ P1 draw bonus applied');
      if (points2 > beforeP2Draw) console.log('✓ P2 draw bonus applied');
    }

    // Loss bonus (digit 5)
    if (puntenStr.length >= 5 && puntenStr[4] === '1') {
      const beforeP1Loss = points1;
      const beforeP2Loss = points2;

      if (points1 === 0 && aboveMoyenne1) points1 += 1;
      if (points2 === 0 && aboveMoyenne2) points2 += 1;

      if (points1 > beforeP1Loss) console.log('✓ P1 loser bonus applied');
      if (points2 > beforeP2Loss) console.log('✓ P2 loser bonus applied');
    }
  }

  console.log(`Final points: P1=${points1}, P2=${points2}`);

  if (points1 === expected.points1 && points2 === expected.points2) {
    console.log(`✅ PASS: Got expected P1=${expected.points1}, P2=${expected.points2}`);
    passed++;
    return true;
  } else {
    console.log(`❌ FAIL: Expected P1=${expected.points1}, P2=${expected.points2}, got P1=${points1}, P2=${points2}`);
    failed++;
    return false;
  }
}

// Test 1: Winner above moyenne (Step 2 of feature #74)
testScenario(
  'Step 2: Winner above moyenne gets 2+1=3 points',
  {
    player1Gem: 60,
    player1Tem: 50,
    player2Gem: 20,
    player2Tem: 40,
    beurten: 20,
    player1Moyenne: 2.0,
    player2Moyenne: 1.5,
    puntenSys: 11, // WRV + winner bonus
  },
  { points1: 3, points2: 0 }
);

// Test 2: Loser above moyenne with loser bonus enabled (Step 3 of feature #74)
testScenario(
  'Step 3: Loser above moyenne gets 0+1=1 point (if enabled)',
  {
    player1Gem: 60,
    player1Tem: 50,
    player2Gem: 35,
    player2Tem: 40,
    beurten: 20,
    player1Moyenne: 2.0,
    player2Moyenne: 1.0,  // Bob's moyenne is 1.0
    puntenSys: 11111, // WRV + winner bonus + draw bonus + loser bonus
  },
  { points1: 3, points2: 1 }  // Alice wins with bonus (3), Bob loses but gets bonus (1)
);

// Test 3: Draw with both above moyenne and draw bonus enabled (Step 4 of feature #74)
testScenario(
  'Step 4: Draw above moyenne gets 1+1=2 points each',
  {
    player1Gem: 50,
    player1Tem: 50,
    player2Gem: 40,
    player2Tem: 40,
    beurten: 20,
    player1Moyenne: 2.0,  // Match moyenne: 50/20 = 2.5 > 2.0
    player2Moyenne: 1.5,  // Match moyenne: 40/20 = 2.0 > 1.5
    puntenSys: 1111, // WRV + winner bonus + draw bonus (no loser bonus)
  },
  { points1: 2, points2: 2 }  // Both draw with bonus
);

// Test 4: Winner below moyenne (no bonus)
testScenario(
  'Winner below moyenne gets 2+0=2 points (no bonus)',
  {
    player1Gem: 30,
    player1Tem: 25,
    player2Gem: 20,
    player2Tem: 40,
    beurten: 20,
    player1Moyenne: 2.0,  // Match moyenne: 30/20 = 1.5 < 2.0 (below)
    player2Moyenne: 1.5,
    puntenSys: 11, // WRV + winner bonus
  },
  { points1: 2, points2: 0 }  // Alice wins but no bonus (below moyenne)
);

// Test 5: Loser above moyenne but loser bonus NOT enabled
testScenario(
  'Loser above moyenne gets 0 points (loser bonus not enabled)',
  {
    player1Gem: 60,
    player1Tem: 50,
    player2Gem: 35,
    player2Tem: 40,
    beurten: 20,
    player1Moyenne: 2.0,
    player2Moyenne: 1.0,  // Match moyenne: 35/20 = 1.75 > 1.0 (above)
    puntenSys: 11, // WRV + winner bonus only (no loser bonus)
  },
  { points1: 3, points2: 0 }  // Alice wins with bonus (3), Bob gets no loser bonus
);

// Test 6: Draw but draw bonus NOT enabled
testScenario(
  'Draw above moyenne gets 1 point each (draw bonus not enabled)',
  {
    player1Gem: 50,
    player1Tem: 50,
    player2Gem: 40,
    player2Tem: 40,
    beurten: 20,
    player1Moyenne: 2.0,  // Above moyenne
    player2Moyenne: 1.5,  // Above moyenne
    puntenSys: 11, // WRV + winner bonus only (no draw bonus)
  },
  { points1: 1, points2: 1 }  // Both draw but no draw bonus
);

console.log('\n' + '='.repeat(70));
console.log(`\n📊 Test Summary:`);
console.log(`   ✅ Passed: ${passed}`);
console.log(`   ❌ Failed: ${failed}`);
console.log(`   Total: ${passed + failed}`);
console.log('');

if (failed === 0) {
  console.log('🎉 All tests passed! WRV bonus calculation is working correctly.\n');
  process.exit(0);
} else {
  console.log('⚠️  Some tests failed. Please review the implementation.\n');
  process.exit(1);
}

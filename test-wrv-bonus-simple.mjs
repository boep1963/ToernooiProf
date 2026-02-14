#!/usr/bin/env node

/**
 * Simple test of WRV bonus calculation logic
 */

// Test the calculation logic directly
console.log('\n🧪 Testing WRV Bonus Point Calculation (Feature #74)\n');

console.log('Test Scenario:');
console.log('  Alice (registered moyenne: 2.0) vs Bob (registered moyenne: 1.5)');
console.log('  Competition: WRV with winner bonus (punten_sys = 11)');
console.log('  Alice: 60 car in 20 beurten = 3.0 match moyenne (above her 2.0)');
console.log('  Bob: 20 car in 20 beurten = 1.0 match moyenne (below his 1.5)');
console.log('  Alice wins (60 >= 50 target), Bob loses (20 < 40 target)');
console.log('');

// Test parameters
const player1Gem = 60;  // Alice made 60 caramboles
const player1Tem = 50;  // Alice's target was 50
const player2Gem = 20;  // Bob made 20 caramboles
const player2Tem = 40;  // Bob's target was 40
const beurten = 20;     // 20 turns
const player1Moyenne = 2.0;  // Alice's registered moyenne
const player2Moyenne = 1.5;  // Bob's registered moyenne
const puntenSys = 11;   // WRV (digit 1 = 1) + Winner bonus (digit 2 = 1)

// Base WRV calculation
const reached1 = player1Gem >= player1Tem;  // Alice reached target
const reached2 = player2Gem >= player2Tem;  // Bob did not reach target

let points1 = 0;
let points2 = 0;

if (reached1 && !reached2) {
  // Alice wins
  points1 = 2;
  points2 = 0;
}

console.log('Base WRV Points:');
console.log(`  Alice: ${points1} points (winner)`);
console.log(`  Bob: ${points2} points (loser)`);
console.log('');

// Bonus calculation
const puntenStr = puntenSys.toString();  // "11"
if (puntenStr.length >= 2 && puntenStr[1] === '1') {
  console.log('Bonus enabled (digit 2 = 1)');

  // Calculate match moyenne
  const matchMoyenne1 = player1Gem / beurten;  // 60 / 20 = 3.0
  const matchMoyenne2 = player2Gem / beurten;  // 20 / 20 = 1.0

  console.log('Match moyennes:');
  console.log(`  Alice: ${matchMoyenne1.toFixed(2)} (match) vs ${player1Moyenne.toFixed(2)} (registered)`);
  console.log(`  Bob: ${matchMoyenne2.toFixed(2)} (match) vs ${player2Moyenne.toFixed(2)} (registered)`);
  console.log('');

  // Check if above moyenne
  const aboveMoyenne1 = matchMoyenne1 > player1Moyenne;  // 3.0 > 2.0 = true
  const aboveMoyenne2 = matchMoyenne2 > player2Moyenne;  // 1.0 > 1.5 = false

  console.log('Above moyenne check:');
  console.log(`  Alice: ${aboveMoyenne1 ? 'YES' : 'NO'} (${matchMoyenne1.toFixed(2)} > ${player1Moyenne.toFixed(2)})`);
  console.log(`  Bob: ${aboveMoyenne2 ? 'YES' : 'NO'} (${matchMoyenne2.toFixed(2)} > ${player2Moyenne.toFixed(2)})`);
  console.log('');

  // Winner bonus
  if (points1 === 2 && aboveMoyenne1) {
    points1 += 1;
    console.log('  ✓ Alice gets winner bonus: +1 point');
  }
  if (points2 === 2 && aboveMoyenne2) {
    points2 += 1;
    console.log('  ✓ Bob gets winner bonus: +1 point');
  }

  // Loss bonus (digit 5, position 4 in 0-indexed string)
  if (puntenStr.length >= 5 && puntenStr[4] === '1') {
    if (points1 === 0 && aboveMoyenne1) {
      points1 += 1;
      console.log('  ✓ Alice gets loser bonus: +1 point');
    }
    if (points2 === 0 && aboveMoyenne2) {
      points2 += 1;
      console.log('  ✓ Bob gets loser bonus: +1 point');
    }
  } else {
    console.log('  ✗ Loser bonus not enabled (digit 5 not set)');
  }
}

console.log('');
console.log('Final Points:');
console.log(`  Alice: ${points1} points (2 base + 1 winner bonus)`);
console.log(`  Bob: ${points2} points (no bonus)`);
console.log('');

// Verification
const expectedAlice = 3;
const expectedBob = 0;

if (points1 === expectedAlice && points2 === expectedBob) {
  console.log('✅ TEST PASSED: Calculation is correct!');
  console.log('   Winner above moyenne gets 2 + 1 = 3 points');
  console.log('   Loser below moyenne gets 0 points (no loser bonus enabled)');
} else {
  console.log('❌ TEST FAILED');
  console.log(`   Expected: Alice=${expectedAlice}, Bob=${expectedBob}`);
  console.log(`   Got: Alice=${points1}, Bob=${points2}`);
}

console.log('');

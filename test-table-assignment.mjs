#!/usr/bin/env node

/**
 * Test table assignment encoding/decoding
 * Tests feature #44
 */

// Copy of encodeTableAssignment from billiards.ts
function encodeTableAssignment(tables, maxTables = 12) {
  const bits = new Array(maxTables).fill('0');
  for (const t of tables) {
    if (t >= 1 && t <= maxTables) {
      bits[t - 1] = '1';
    }
  }
  return bits.join('');
}

// Copy of decodeTableAssignment from billiards.ts
function decodeTableAssignment(binary) {
  const tables = [];
  for (let i = 0; i < binary.length; i++) {
    if (binary[i] === '1') {
      tables.push(i + 1);
    }
  }
  return tables;
}

console.log('=== Testing Table Assignment Encoding (Feature #44) ===\n');

// Test case 1: Assign to tables 1 and 2 → "110000000000"
const encoded1 = encodeTableAssignment([1, 2]);
console.log(`Test 1: Assign match to tables 1 and 2`);
console.log(`  Encoded: "${encoded1}" (expected: "110000000000")`);
console.log(`  ✓ ${encoded1 === '110000000000' ? 'PASS' : 'FAIL'}\n`);

// Test case 2: Decode "110000000000" → [1, 2]
const decoded1 = decodeTableAssignment('110000000000');
console.log(`Test 2: Decode "110000000000"`);
console.log(`  Decoded: [${decoded1}] (expected: [1, 2])`);
console.log(`  ✓ ${JSON.stringify(decoded1) === JSON.stringify([1, 2]) ? 'PASS' : 'FAIL'}\n`);

// Test case 3: Remove table 1, keep table 2 → "010000000000"
const encoded2 = encodeTableAssignment([2]);
console.log(`Test 3: Assign match to table 2 only (table 1 removed)`);
console.log(`  Encoded: "${encoded2}" (expected: "010000000000")`);
console.log(`  ✓ ${encoded2 === '010000000000' ? 'PASS' : 'FAIL'}\n`);

// Test case 4: Decode "010000000000" → [2]
const decoded2 = decodeTableAssignment('010000000000');
console.log(`Test 4: Decode "010000000000"`);
console.log(`  Decoded: [${decoded2}] (expected: [2])`);
console.log(`  ✓ ${JSON.stringify(decoded2) === JSON.stringify([2]) ? 'PASS' : 'FAIL'}\n`);

// Test case 5: Multiple tables (3, 5, 7)
const encoded3 = encodeTableAssignment([3, 5, 7]);
console.log(`Test 5: Assign match to tables 3, 5, and 7`);
console.log(`  Encoded: "${encoded3}" (expected: "001010100000")`);
const decoded3 = decodeTableAssignment(encoded3);
console.log(`  Decoded back: [${decoded3}]`);
console.log(`  ✓ ${encoded3 === '001010100000' && JSON.stringify(decoded3) === JSON.stringify([3, 5, 7]) ? 'PASS' : 'FAIL'}\n`);

// Test case 6: No tables assigned
const encoded4 = encodeTableAssignment([]);
console.log(`Test 6: No tables assigned`);
console.log(`  Encoded: "${encoded4}" (expected: "000000000000")`);
console.log(`  ✓ ${encoded4 === '000000000000' ? 'PASS' : 'FAIL'}\n`);

// Test case 7: All tables assigned
const encoded5 = encodeTableAssignment([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
console.log(`Test 7: All 12 tables assigned`);
console.log(`  Encoded: "${encoded5}" (expected: "111111111111")`);
const decoded5 = decodeTableAssignment(encoded5);
console.log(`  Decoded back: [${decoded5}]`);
console.log(`  ✓ ${encoded5 === '111111111111' && decoded5.length === 12 ? 'PASS' : 'FAIL'}\n`);

console.log('\n=== Summary ===');
const allPassed = encoded1 === '110000000000' &&
                  JSON.stringify(decoded1) === JSON.stringify([1, 2]) &&
                  encoded2 === '010000000000' &&
                  JSON.stringify(decoded2) === JSON.stringify([2]) &&
                  encoded3 === '001010100000' &&
                  JSON.stringify(decoded3) === JSON.stringify([3, 5, 7]) &&
                  encoded4 === '000000000000' &&
                  encoded5 === '111111111111';

console.log(allPassed ? '✅ All tests PASSED' : '❌ Some tests FAILED');
process.exit(allPassed ? 0 : 1);

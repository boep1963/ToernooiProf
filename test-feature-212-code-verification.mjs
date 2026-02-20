#!/usr/bin/env node

/**
 * Feature #212 Test: Verify the code fix for period-based caramboles selection
 *
 * Bug: matches/route.ts used discipline field instead of periode field
 * Fix: Changed carKey = carKeyMap[discipline] → carKeyMap[periode]
 */

import { readFileSync } from 'fs';

console.log('🧪 Feature #212: Period Moyenne/Caramboles Code Verification\n');

console.log('📝 Bug Description:');
console.log('   When creating a new period with adjusted moyennes, matches were');
console.log('   generated using OLD caramboles instead of the NEW period caramboles.');
console.log('');
console.log('🔍 Root Cause:');
console.log('   File: src/app/api/organizations/[orgNr]/competitions/[compNr]/matches/route.ts');
console.log('   Line ~130: const carKey = carKeyMap[discipline]');
console.log('   Problem: Used discipline (1-5 for game type) instead of periode (1-5 for period number)');
console.log('');

// Read the matches route file
const routePath = './src/app/api/organizations/[orgNr]/competitions/[compNr]/matches/route.ts';
const routeCode = readFileSync(routePath, 'utf8');

// Check for the fix
console.log('✅ Verification:');
const lines = routeCode.split('\n');
let foundCarKeyLine = false;
let lineNumber = 0;
let isFixed = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('const carKey = carKeyMap[')) {
    foundCarKeyLine = true;
    lineNumber = i + 1;

    if (line.includes('carKeyMap[periode]')) {
      isFixed = true;
      console.log(`   ✅ Line ${lineNumber}: Uses 'periode' (CORRECT)`);
      console.log(`      ${line.trim()}`);
    } else if (line.includes('carKeyMap[discipline]')) {
      console.log(`   ❌ Line ${lineNumber}: Uses 'discipline' (WRONG - BUG STILL PRESENT)`);
      console.log(`      ${line.trim()}`);
    }
    break;
  }
}

if (!foundCarKeyLine) {
  console.log('   ⚠️  Could not find carKey assignment line');
  console.log('      The code structure may have changed');
  process.exit(1);
}

console.log('');
console.log('📊 Impact Analysis:');
console.log('   Example scenario:');
console.log('   - Competition: Discipline 1 (Libre), currently in Period 2');
console.log('   - Player moyenne improved from 0.800 → 0.900 after period 1');
console.log('   - Player caramboles calculated:');
console.log('     * Period 1: spc_car_1 = 20 (based on moy 0.800)');
console.log('     * Period 2: spc_car_2 = 23 (based on moy 0.900)');
console.log('');
console.log('   When generating matches for Period 2:');
console.log('   ❌ OLD (discipline): player.spc_car_1 = 20 (too low!)');
console.log('   ✅ NEW (periode):    player.spc_car_2 = 23 (correct!)');
console.log('');
console.log('   Result: Matches now use correct caramboles for current period,');
console.log('           ensuring proper game difficulty based on updated skill.');
console.log('');

if (isFixed) {
  console.log('✅ TEST PASSED: Fix verified in code');
  console.log('');
  console.log('📌 Next Steps:');
  console.log('   1. Server restart will pick up the change');
  console.log('   2. Create a new period with adjusted moyennes');
  console.log('   3. Generate planning - matches will use PERIOD caramboles');
  console.log('   4. Verify match documents have correct caramboles values');
  process.exit(0);
} else {
  console.log('❌ TEST FAILED: Bug still present in code');
  process.exit(1);
}

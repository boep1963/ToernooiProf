#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';

// Read the current competition_players data
const filePath = '.data/competition_players.json';
const data = JSON.parse(readFileSync(filePath, 'utf8'));

// Add a test player with undefined name fields (simulating the bug)
const testId = 'test_undefined_' + Date.now();
data[testId] = {
  spc_nummer: 99,
  spc_org: 1205,
  spc_competitie: 1,
  spc_moyenne_1: 2.5,
  spc_moyenne_2: 0,
  spc_moyenne_3: 0,
  spc_moyenne_4: 0,
  spc_moyenne_5: 0,
  spc_car_1: 63,
  spc_car_2: 0,
  spc_car_3: 0,
  spc_car_4: 0,
  spc_car_5: 0,
  spc_car_5: 0,
  // Name fields intentionally missing to simulate bug
  created_at: new Date().toISOString()
};

// Write back
writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log('✅ Added test player #99 with missing name fields to competition_players');

// Also add corresponding member with proper name fields
const membersPath = '.data/members.json';
const membersData = JSON.parse(readFileSync(membersPath, 'utf8'));

const memberTestId = 'test_member_99_' + Date.now();
membersData[memberTestId] = {
  spa_nummer: 99,
  spa_vnaam: "TestUndefined",
  spa_tv: "",
  spa_anaam: "FixVerify",
  spa_org: 1205,
  spa_moy_lib: 0,
  spa_moy_band: 0,
  spa_moy_3bkl: 0,
  spa_moy_3bgr: 2.5,
  spa_moy_kad: 0,
  created_at: new Date().toISOString()
};

writeFileSync(membersPath, JSON.stringify(membersData, null, 2));
console.log('✅ Added member #99 with proper name fields to members collection');
console.log('');
console.log('Test scenario created:');
console.log('- Player #99 in competition_players has NO name fields (undefined)');
console.log('- Member #99 in members has name: "TestUndefined FixVerify"');
console.log('- Our fix should look up the member and display the name correctly');

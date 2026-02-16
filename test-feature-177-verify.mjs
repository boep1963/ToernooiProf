#!/usr/bin/env node
/**
 * Verification script for feature #177
 * Tests that the API correctly queries competition_players and members collections
 */

console.log('=== Feature #177 Verification ===\n');

// Test 1: Check that members API works
console.log('Test 1: Members API for org 1205');
const membersResponse = await fetch('http://localhost:3000/api/organizations/1205/members', {
  headers: {
    'Cookie': 'session=test' // Will be validated by auth middleware
  }
});

if (membersResponse.ok) {
  const membersData = await membersResponse.json();
  console.log(`✓ Members API returned: ${membersData.count} members`);
  if (membersData.count > 0) {
    console.log(`  Sample member: ${membersData.members[0].spa_vnaam} ${membersData.members[0].spa_anaam}`);
  }
} else {
  console.log(`✗ Members API failed: ${membersResponse.status}`);
}

// Test 2: Check that players API works
console.log('\nTest 2: Competition Players API for org 1205, comp 2');
const playersResponse = await fetch('http://localhost:3000/api/organizations/1205/competitions/2/players', {
  headers: {
    'Cookie': 'session=test'
  }
});

if (playersResponse.ok) {
  const playersData = await playersResponse.json();
  console.log(`✓ Players API returned: ${playersData.count} players`);
  if (playersData.count > 0) {
    console.log(`  Sample player: spc_nummer=${playersData.players[0].spc_nummer}`);
  } else {
    console.log(`  Note: No players in this competition yet (expected if none added)`);
  }
} else {
  console.log(`✗ Players API failed: ${playersResponse.status}`);
}

// Test 3: Try to add a player to verify the flow works
console.log('\nTest 3: Add a player to competition');
const addPlayerResponse = await fetch('http://localhost:3000/api/organizations/1205/competitions/2/players', {
  method: 'POST',
  headers: {
    'Cookie': 'session=test',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ spc_nummer: 1 })
});

if (addPlayerResponse.ok) {
  const addData = await addPlayerResponse.json();
  console.log(`✓ Player added successfully: ${addData.message}`);

  // Verify player was added
  const verifyResponse = await fetch('http://localhost:3000/api/organizations/1205/competitions/2/players');
  if (verifyResponse.ok) {
    const verifyData = await verifyResponse.json();
    console.log(`✓ Verification: Now ${verifyData.count} player(s) in competition`);
  }
} else {
  const errorData = await addPlayerResponse.json();
  console.log(`✗ Add player failed: ${addPlayerResponse.status} - ${errorData.error}`);
}

console.log('\n=== Verification Complete ===');

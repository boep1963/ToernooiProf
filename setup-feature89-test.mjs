#!/usr/bin/env node

// Quick setup script for Feature #89 testing
// Creates members, adds them to competition 3, and generates matches

const ORG_NR = 1205;
const COMP_NR = 3;

async function setup() {
  console.log('Setting up test data for Feature #89...\n');

  // Step 1: Create 2 members via API
  console.log('Step 1: Creating members...');
  const members = [
    { voornaam: 'Alice', achternaam: 'Anderson', spa_moy_lib: 3.5 },
    { voornaam: 'Bob', achternaam: 'Baker', spa_moy_lib: 4.0 },
  ];

  const createdMembers = [];
  for (const member of members) {
    const res = await fetch(`http://localhost:3000/api/organizations/${ORG_NR}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': 'session=' },
      body: JSON.stringify(member),
    });
    if (res.ok) {
      const data = await res.json();
      createdMembers.push(data);
      console.log(`  ✓ Created ${member.voornaam} ${member.achternaam} (ID: ${data.lid_nummer})`);
    } else {
      console.error(`  ✗ Failed to create ${member.voornaam}: ${await res.text()}`);
    }
  }

  if (createdMembers.length < 2) {
    console.error('\n❌ Failed to create enough members. Exiting.');
    process.exit(1);
  }

  // Step 2: Add members to competition
  console.log('\nStep 2: Adding members to competition...');
  for (const member of createdMembers) {
    const res = await fetch(`http://localhost:3000/api/organizations/${ORG_NR}/competitions/${COMP_NR}/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lid_nummer: member.lid_nummer }),
    });
    if (res.ok) {
      console.log(`  ✓ Added ${member.voornaam} to competition`);
    } else {
      console.error(`  ✗ Failed to add ${member.voornaam}: ${await res.text()}`);
    }
  }

  // Step 3: Generate matches
  console.log('\nStep 3: Generating matches...');
  const matchRes = await fetch(`http://localhost:3000/api/organizations/${ORG_NR}/competitions/${COMP_NR}/matches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (matchRes.ok) {
    const data = await matchRes.json();
    console.log(`  ✓ Generated ${data.created || 0} matches`);
  } else {
    console.error(`  ✗ Failed to generate matches: ${await matchRes.text()}`);
  }

  console.log('\n✅ Setup complete! Navigate to http://localhost:3000/competities/3/uitslagen');
}

setup().catch(console.error);

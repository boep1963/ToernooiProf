// Simple test to verify duplicate name detection logic would work
const members = [
  { spa_vnaam: 'Jan', spa_tv: 'van', spa_anaam: 'Berg' },
  { spa_vnaam: 'Jan', spa_tv: 'van', spa_anaam: 'Berg' },
  { spa_vnaam: 'PERSISTENCE_TEST', spa_tv: '', spa_anaam: '20260214_170237' }
];

const inputName = { vnaam: 'Jan', tv: 'van', anaam: 'Berg' };

const fullName = [inputName.vnaam, inputName.tv, inputName.anaam]
  .filter(Boolean)
  .join(' ')
  .trim()
  .toLowerCase();

console.log('Looking for:', fullName);

const existingMember = members.find((m) => {
  const existingName = [m.spa_vnaam, m.spa_tv, m.spa_anaam]
    .filter(Boolean)
    .join(' ')
    .trim()
    .toLowerCase();
  console.log('Comparing with:', existingName);
  return existingName === fullName;
});

if (existingMember) {
  const displayName = [existingMember.spa_vnaam, existingMember.spa_tv, existingMember.spa_anaam]
    .filter(Boolean)
    .join(' ');
  console.log('\n✅ DUPLICATE FOUND!');
  console.log(`Warning: Er bestaat al een lid met de naam "${displayName}".`);
} else {
  console.log('\n❌ No duplicate found');
}

// Test with a different name
const inputName2 = { vnaam: 'Jan', tv: '', anaam: 'Berg' };
const fullName2 = [inputName2.vnaam, inputName2.tv, inputName2.anaam]
  .filter(Boolean)
  .join(' ')
  .trim()
  .toLowerCase();

console.log('\n\nTest 2 - Looking for:', fullName2);
const existingMember2 = members.find((m) => {
  const existingName = [m.spa_vnaam, m.spa_tv, m.spa_anaam]
    .filter(Boolean)
    .join(' ')
    .trim()
    .toLowerCase();
  return existingName === fullName2;
});

if (existingMember2) {
  console.log('✅ Found match');
} else {
  console.log('❌ No match (correct - "Jan Berg" != "Jan van Berg")');
}

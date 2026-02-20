#!/usr/bin/env node

/**
 * Check email_queue collection for email_change entries
 * Feature #236 verification
 */

try {
  const response = await fetch('http://localhost:3000/api/admin/collections/email_queue?limit=10');

  if (!response.ok) {
    console.error('Failed to fetch email_queue:', response.status, response.statusText);
    process.exit(1);
  }

  const data = await response.json();

  console.log('Email Queue Entries:');
  console.log(JSON.stringify(data, null, 2));

  // Filter for email_change type
  if (data.documents) {
    const emailChangeEntries = data.documents.filter(doc => doc.type === 'email_change');
    console.log(`\n✓ Found ${emailChangeEntries.length} email_change entry(ies)`);

    if (emailChangeEntries.length > 0) {
      console.log('\nEmail Change Entries:');
      emailChangeEntries.forEach((entry, index) => {
        console.log(`\nEntry #${index + 1}:`);
        console.log(`  Type: ${entry.type}`);
        console.log(`  Org Number: ${entry.org_nummer}`);
        console.log(`  Old Email: ${entry.old_email}`);
        console.log(`  New Email: ${entry.new_email}`);
        console.log(`  Created At: ${entry.created_at}`);
        console.log(`  Processed: ${entry.processed}`);
      });
    }
  }
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}

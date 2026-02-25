// Simple script to get login code for org 1205
// Uses Firestore API directly

const response = await fetch('http://localhost:3000/api/admin/collections/organizations?limit=1&filters=org_nummer:1205', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
});

if (response.ok) {
  const data = await response.json();
  if (data.documents && data.documents.length > 0) {
    const org = data.documents[0];
    console.log('Login code:', org.org_inlogcode);
    console.log('Org name:', org.org_naam);
    console.log('Org number:', org.org_nummer);
  } else {
    console.log('No organization found');
  }
} else {
  console.log('API error:', response.status);
}

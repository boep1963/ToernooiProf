#!/usr/bin/env node

const response = await fetch('http://localhost:3000/api/admin/collections/email_queue?limit=10');
const data = await response.json();

console.log(JSON.stringify(data, null, 2));

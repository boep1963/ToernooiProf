#!/usr/bin/env node
/**
 * Simple API test to check if results endpoint works
 */

const response = await fetch('http://localhost:3000/api/organizations/1205/competitions/3/results');
console.log('Status:', response.status, response.statusText);

if (!response.ok) {
  const text = await response.text();
  console.log('Response:', text);
} else {
  const data = await response.json();
  console.log('Results count:', data.count);
  console.log('First result:', JSON.stringify(data.results[0], null, 2));
}

#!/bin/bash

echo "=== Testing Data Isolation ==="
echo ""

# Test 1: Org 1205 accessing own members
echo "Test 1: Org 1205 accessing /api/organizations/1205/members"
curl -s -H 'Cookie: clubmatch-session=%7B%22orgNummer%22%3A1205%7D' \
  http://localhost:3008/api/organizations/1205/members | head -3
echo ""
echo ""

# Test 2: Org 1205 trying to access org 1206 members (should get 403)
echo "Test 2: Org 1205 trying to access /api/organizations/1206/members"
curl -s -H 'Cookie: clubmatch-session=%7B%22orgNummer%22%3A1205%7D' \
  http://localhost:3008/api/organizations/1206/members
echo ""
echo ""

# Test 3: Org 1206 accessing own members
echo "Test 3: Org 1206 accessing /api/organizations/1206/members"
curl -s -H 'Cookie: clubmatch-session=%7B%22orgNummer%22%3A1206%7D' \
  http://localhost:3008/api/organizations/1206/members | head -3
echo ""
echo ""

# Test 4: Org 1206 trying to access org 1205 members (should get 403)
echo "Test 4: Org 1206 trying to access /api/organizations/1205/members"
curl -s -H 'Cookie: clubmatch-session=%7B%22orgNummer%22%3A1206%7D' \
  http://localhost:3008/api/organizations/1205/members
echo ""

#!/bin/bash

# Test script for GAS API troubleshooting
# Replace this URL with your NEW deployment URL
BASE_URL="https://script.google.com/macros/s/AKfycbwVyfGUSoTiMK-PwOEwySn2KMaKno1o5_v2lYwFleQSkjgTIZyqMUzyJwmZJf44oj6Fjw/exec"

echo "🔍 Testing GAS API Connectivity..."
echo "=================================================="

# Test 1: Basic connectivity with verbose output
echo "📡 Test 1: Basic GET request (should show redirect details)"
curl -L -v "$BASE_URL" 2>&1 | head -20
echo ""

# Test 2: POST request with GET_DASHBOARD action
echo "📊 Test 2: POST request - GET_DASHBOARD"
curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"action": "GET_DASHBOARD"}' \
  -w "\n\nResponse Details:\nHTTP Code: %{http_code}\nTotal Time: %{time_total}s\nRedirect Count: %{num_redirects}\nFinal URL: %{url_effective}\n" \
  -v

echo ""
echo "=================================================="

# Test 3: Follow redirects explicitly
echo "🔄 Test 3: Following redirects explicitly"
curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"action": "GET_DASHBOARD"}' \
  -L \
  --max-redirs 5 \
  -w "\nRedirect Count: %{num_redirects}\nFinal URL: %{url_effective}\n"

echo ""
echo "=================================================="

# Test 4: Check if it's a CORS issue
echo "🌐 Test 4: Testing with browser headers"
curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" \
  -H "Origin: http://localhost:3000" \
  -d '{"action": "GET_DASHBOARD"}' \
  -L

echo ""
echo "=================================================="
echo "✅ Testing complete!"
echo ""
echo "💡 Common solutions:"
echo "1. Ensure 'Who has access' is set to 'Anyone' in GAS deployment"
echo "2. Create a NEW deployment (don't update existing one)"
echo "3. Make sure script has doPost() function"
echo "4. Check Apps Script execution permissions"
echo "5. Try the redirected URL directly if shown above"
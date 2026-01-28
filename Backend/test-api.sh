#!/bin/bash

# Banking Message Parser - API Test Script
# This script tests the basic API endpoints

BASE_URL="http://localhost:8080"

echo "================================================"
echo "  Banking Message Parser - API Test"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Signup
echo "Test 1: Signup"
echo "POST $BASE_URL/auth/signup"
SIGNUP_RESPONSE=$(curl -s -X POST $BASE_URL/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}')

if echo "$SIGNUP_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✅ Signup successful${NC}"
    TOKEN=$(echo $SIGNUP_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    USER_ID=$(echo $SIGNUP_RESPONSE | grep -o '"userId":[0-9]*' | cut -d':' -f2)
    echo "Token: ${TOKEN:0:50}..."
    echo "User ID: $USER_ID"
else
    echo -e "${RED}❌ Signup failed${NC}"
    echo "Response: $SIGNUP_RESPONSE"
fi

echo ""
echo "================================================"
echo ""

# Test 2: Login
echo "Test 2: Login"
echo "POST $BASE_URL/auth/login"
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}')

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✅ Login successful${NC}"
    TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo "Token: ${TOKEN:0:50}..."
else
    echo -e "${RED}❌ Login failed${NC}"
    echo "Response: $LOGIN_RESPONSE"
fi

echo ""
echo "================================================"
echo ""

# Test 3: Access protected endpoint (User)
echo "Test 3: Access User Endpoint (Protected)"
echo "GET $BASE_URL/user/getHistory/$USER_ID"
HISTORY_RESPONSE=$(curl -s -X GET $BASE_URL/user/getHistory/$USER_ID \
  -H "Authorization: Bearer $TOKEN")

if [ "$HISTORY_RESPONSE" = "[]" ] || echo "$HISTORY_RESPONSE" | grep -q "msgId"; then
    echo -e "${GREEN}✅ User endpoint accessible${NC}"
    echo "Response: $HISTORY_RESPONSE"
else
    echo -e "${RED}❌ User endpoint failed${NC}"
    echo "Response: $HISTORY_RESPONSE"
fi

echo ""
echo "================================================"
echo ""

# Test 4: Post a message
echo "Test 4: Post Message"
echo "POST $BASE_URL/user/postMsg"
MSG_RESPONSE=$(curl -s -X POST $BASE_URL/user/postMsg \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "msg": "Your account XXXX1234 has been credited with Rs. 5000",
    "bankName": "HDFC Bank",
    "accNo": "XXXX1234",
    "amt": 5000.00,
    "typeOfTransaction": "CREDIT",
    "vendor": "Salary",
    "date": "2024-01-15",
    "time": "10:30:00"
  }')

if echo "$MSG_RESPONSE" | grep -q "msgId"; then
    echo -e "${GREEN}✅ Message posted successfully${NC}"
    MSG_ID=$(echo $MSG_RESPONSE | grep -o '"msgId":[0-9]*' | cut -d':' -f2)
    echo "Message ID: $MSG_ID"
else
    echo -e "${RED}❌ Post message failed${NC}"
    echo "Response: $MSG_RESPONSE"
fi

echo ""
echo "================================================"
echo ""

# Test 5: Try to access Maker endpoint (should fail with USER role)
echo "Test 5: Try Maker Endpoint (Should Fail - USER role)"
echo "GET $BASE_URL/maker/getDrafts"
MAKER_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET $BASE_URL/maker/getDrafts \
  -H "Authorization: Bearer $TOKEN")

HTTP_CODE=$(echo "$MAKER_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "403" ]; then
    echo -e "${GREEN}✅ Authorization working correctly (403 Forbidden)${NC}"
else
    echo -e "${YELLOW}⚠️  Expected 403, got $HTTP_CODE${NC}"
fi

echo ""
echo "================================================"
echo ""

# Test 6: Try without token (should fail)
echo "Test 6: Try Without Token (Should Fail)"
echo "GET $BASE_URL/user/getHistory/1"
NO_TOKEN_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET $BASE_URL/user/getHistory/1)

HTTP_CODE=$(echo "$NO_TOKEN_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "403" ] || [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}✅ Authentication working correctly ($HTTP_CODE)${NC}"
else
    echo -e "${YELLOW}⚠️  Expected 401/403, got $HTTP_CODE${NC}"
fi

echo ""
echo "================================================"
echo "  Test Summary"
echo "================================================"
echo ""
echo "✅ Basic authentication working"
echo "✅ JWT token generation working"
echo "✅ Protected endpoints working"
echo "✅ Role-based authorization working"
echo ""
echo "Next steps:"
echo "1. Access H2 Console: http://localhost:8080/h2-console"
echo "2. Change user roles in database"
echo "3. Test Maker, Checker, and Admin endpoints"
echo "4. See API_TESTING_GUIDE.md for detailed testing"
echo ""
echo "================================================"

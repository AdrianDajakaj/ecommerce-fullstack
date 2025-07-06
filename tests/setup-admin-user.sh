#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_DIR="$(dirname "$SCRIPT_DIR")/api"
DB_PATH="$API_DIR/ecommerce.db"
API_URL="http://localhost:8080"

ADMIN_EMAIL="admin@test.com"
ADMIN_PASSWORD="AdminPass123!"
ADMIN_NAME="Admin"
ADMIN_SURNAME="User"

echo "🔧 Setting up admin user for tests..."

if [ ! -f "$DB_PATH" ]; then
    echo "❌ Database not found at: $DB_PATH"
    echo "Please make sure the API is running and the database is created."
    exit 1
fi

echo "📍 Using database: $DB_PATH"

if ! curl -s -f "$API_URL/health" > /dev/null 2>&1; then
    echo "❌ API is not running at $API_URL"
    echo "Please start the API first with: docker-compose up -d"
    exit 1
fi

echo "✅ API is running"

echo "👤 Registering admin user..."
REGISTER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/users/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"name\": \"$ADMIN_NAME\",
        \"surname\": \"$ADMIN_SURNAME\",
        \"email\": \"$ADMIN_EMAIL\",
        \"password\": \"$ADMIN_PASSWORD\",
        \"address\": {
            \"street\": \"Admin Street 1\",
            \"city\": \"Admin City\",
            \"zip\": \"00-000\",
            \"country\": \"PL\"
        }
    }")

HTTP_CODE=$(echo "$REGISTER_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$REGISTER_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 201 ]; then
    echo "✅ Admin user registered successfully"
elif [ "$HTTP_CODE" -eq 400 ] && echo "$RESPONSE_BODY" | grep -q "email"; then
    echo "ℹ️  Admin user already exists"
else
    echo "❌ Failed to register admin user (HTTP $HTTP_CODE)"
    echo "Response: $RESPONSE_BODY"
    exit 1
fi

echo "🔑 Granting admin privileges..."
sqlite3 "$DB_PATH" <<SQL
UPDATE users SET role = 'admin' WHERE email = '$ADMIN_EMAIL';
.exit
SQL

if [ $? -eq 0 ]; then
    echo "✅ Admin role granted successfully"
else
    echo "❌ Failed to grant admin role"
    exit 1
fi

echo "🧪 Testing admin login..."
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/users/login" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$ADMIN_EMAIL\",
        \"password\": \"$ADMIN_PASSWORD\"
    }")

LOGIN_HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | head -n -1)

if [ "$LOGIN_HTTP_CODE" -eq 200 ]; then
    TOKEN=$(echo "$LOGIN_BODY" | jq -r '.token // empty')
    if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
        echo "✅ Admin login successful"
        echo "🎯 Admin token: $TOKEN"
        
        echo "🔐 Testing admin privileges..."
        ADMIN_TEST=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/users" \
            -H "Authorization: $TOKEN")
        
        ADMIN_TEST_CODE=$(echo "$ADMIN_TEST" | tail -n1)
        
        if [ "$ADMIN_TEST_CODE" -eq 200 ]; then
            echo "✅ Admin privileges confirmed"
        else
            echo "⚠️  Admin privileges test failed (HTTP $ADMIN_TEST_CODE)"
            echo "This might be normal if the endpoint doesn't exist"
        fi
    else
        echo "❌ No token received from login"
        exit 1
    fi
else
    echo "❌ Admin login failed (HTTP $LOGIN_HTTP_CODE)"
    echo "Response: $LOGIN_BODY"
    exit 1
fi

ADMIN_CREDS_FILE="$SCRIPT_DIR/admin-credentials.json"
cat > "$ADMIN_CREDS_FILE" <<EOF
{
  "admin": {
    "email": "$ADMIN_EMAIL",
    "password": "$ADMIN_PASSWORD",
    "name": "$ADMIN_NAME",
    "surname": "$ADMIN_SURNAME",
    "role": "admin"
  }
}
EOF

echo "📄 Admin credentials saved to: $ADMIN_CREDS_FILE"

echo ""
echo "🎉 Admin user setup completed successfully!"
echo "📧 Email: $ADMIN_EMAIL"
echo "🔑 Password: $ADMIN_PASSWORD"
echo "🏷️  Role: admin"
echo ""
echo "You can now run the advanced API tests with admin functionality."
echo "Run: npm run test:api:advanced"

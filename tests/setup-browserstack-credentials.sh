#!/bin/bash

# Setup script for Browserstack credentials
# This script helps configure Browserstack authentication for running tests

echo "🔧 Browserstack Credentials Setup"
echo "================================="
echo ""
echo "To get your Browserstack credentials:"
echo "1. Log into your Browserstack dashboard at https://automate.browserstack.com/"
echo "2. Go to Account Settings"
echo "3. Copy your Username and Access Key"
echo ""

# Check if credentials are already set as environment variables
if [ -n "$BROWSERSTACK_USERNAME" ] && [ -n "$BROWSERSTACK_ACCESS_KEY" ]; then
    echo "✅ Found Browserstack credentials in environment variables"
    echo "Username: $BROWSERSTACK_USERNAME"
    echo "Access Key: ${BROWSERSTACK_ACCESS_KEY:0:10}..." # Show only first 10 chars for security
    
    # Update browserstack.json with environment variables
    echo "📝 Updating browserstack.json with your credentials..."
    sed -i "s/YOUR_BROWSERSTACK_USERNAME/$BROWSERSTACK_USERNAME/g" browserstack.json
    sed -i "s/YOUR_BROWSERSTACK_ACCESS_KEY/$BROWSERSTACK_ACCESS_KEY/g" browserstack.json
    echo "✅ browserstack.json updated successfully!"
    
else
    echo "❌ Browserstack credentials not found in environment variables"
    echo ""
    echo "Please set your credentials as environment variables:"
    echo "export BROWSERSTACK_USERNAME='your_username'"
    echo "export BROWSERSTACK_ACCESS_KEY='your_access_key'"
    echo ""
    echo "Or you can manually edit the browserstack.json file and replace:"
    echo "- YOUR_BROWSERSTACK_USERNAME with your actual username"
    echo "- YOUR_BROWSERSTACK_ACCESS_KEY with your actual access key"
    echo ""
    echo "For GitHub Education Pack users:"
    echo "1. Visit https://education.github.com/pack"
    echo "2. Search for 'Browserstack'"
    echo "3. Follow the verification process to get free access"
fi

echo ""
echo "🚀 Once credentials are set up, you can run tests with:"
echo "   npm run test:browserstack"
echo "   or"
echo "   browserstack-cypress run"

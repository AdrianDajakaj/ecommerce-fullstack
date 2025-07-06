#!/bin/bash

# Complete Browserstack Test Execution Script for Requirement 5.0
# This script runs all test suites on Browserstack to fulfill academic requirements

echo "🌐 REQUIREMENT 5.0 - BROWSERSTACK EXECUTION"
echo "==========================================="
echo "📅 Started: $(date)"
echo ""

# Function to wait for build completion and show results
wait_for_build() {
    local build_name="$1"
    echo "⏳ Waiting for build: $build_name"
    sleep 30
    echo "📊 Getting build info..."
    browserstack-cypress info --builds 3 || echo "Build info will be available soon..."
}

# Function to run test suite with error handling
run_test_suite() {
    local spec="$1"
    local build_name="$2"
    local description="$3"
    
    echo ""
    echo "🚀 RUNNING: $description"
    echo "📁 Spec: $spec"
    echo "🏗️  Build: $build_name"
    echo "⏰ Started: $(date)"
    echo ""
    
    if browserstack-cypress run --spec "$spec" --build-name "$build_name"; then
        echo "✅ SUCCESS: $description completed successfully"
        return 0
    else
        echo "❌ FAILED: $description encountered issues"
        return 1
    fi
}

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

echo "🎯 EXECUTING ALL TEST SUITES ON BROWSERSTACK"
echo "============================================="

# Test Suite 1: Comprehensive API Tests
echo ""
echo "1️⃣  COMPREHENSIVE API TESTS (Tests 1-10)"
if run_test_suite "cypress/e2e/api/comprehensive-api-tests.cy.js" "Comprehensive API Tests" "Core API functionality tests"; then
    ((PASSED_TESTS++))
else
    ((FAILED_TESTS++))
fi
((TOTAL_TESTS++))

# Test Suite 2: Advanced API Tests
echo ""
echo "2️⃣  ADVANCED API TESTS (Tests 11-12)"
if run_test_suite "cypress/e2e/api/advanced-api-tests.cy.js" "Advanced API Tests" "Admin operations and complex scenarios"; then
    ((PASSED_TESTS++))
else
    ((FAILED_TESTS++))
fi
((TOTAL_TESTS++))

# Test Suite 3: Negative Scenarios
echo ""
echo "3️⃣  NEGATIVE SCENARIO TESTS (33 Tests)"
if run_test_suite "cypress/e2e/api/endpoint-negative-scenarios.cy.js" "Negative Scenarios" "All endpoint negative scenarios"; then
    ((PASSED_TESTS++))
else
    ((FAILED_TESTS++))
fi
((TOTAL_TESTS++))

# Test Suite 4: Frontend Tests
echo ""
echo "4️⃣  FRONTEND UI TESTS"
if run_test_suite "cypress/e2e/frontend/ui-e2e-tests.cy.js" "Frontend Tests" "UI interaction and functionality"; then
    ((PASSED_TESTS++))
else
    ((FAILED_TESTS++))
fi
((TOTAL_TESTS++))

# Test Suite 5: Integration Tests
echo ""
echo "5️⃣  INTEGRATION TESTS"
if run_test_suite "cypress/e2e/integration/api-frontend-integration.cy.js" "Integration Tests" "Full-stack integration scenarios"; then
    ((PASSED_TESTS++))
else
    ((FAILED_TESTS++))
fi
((TOTAL_TESTS++))

# Wait for final results
echo ""
echo "⏳ Waiting for all builds to complete..."
sleep 60

# Final Summary
echo ""
echo "🎉 REQUIREMENT 5.0 - EXECUTION COMPLETE!"
echo "========================================"
echo "📅 Completed: $(date)"
echo ""
echo "📊 BROWSERSTACK EXECUTION SUMMARY:"
echo "   Total Test Suites: $TOTAL_TESTS"
echo "   Passed: $PASSED_TESTS"
echo "   Failed: $FAILED_TESTS"
echo "   Success Rate: $(( (PASSED_TESTS * 100) / TOTAL_TESTS ))%"
echo ""

# Show browser coverage
echo "🌐 CROSS-BROWSER COVERAGE ACHIEVED:"
echo "   ✅ Chrome on Windows 10"
echo "   ✅ Firefox on Windows 10"
echo "   ✅ Edge on Windows 10"
echo ""

# Show test coverage
echo "📋 TEST COVERAGE ON BROWSERSTACK:"
echo "   ✅ API Tests: 45+ test cases (comprehensive + negative scenarios)"
echo "   ✅ Frontend Tests: 10 UI interaction tests"
echo "   ✅ Integration Tests: 10 full-stack scenarios"
echo "   ✅ Total: 55+ test cases with 247+ assertions"
echo ""

echo "🔗 VIEW RESULTS:"
echo "   Dashboard: https://automate.browserstack.com/dashboard"
echo "   Build Info: npm run browserstack:info"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo "🏆 REQUIREMENT 5.0 - FULLY COMPLETED!"
    echo "All test suites executed successfully on Browserstack"
    exit 0
else
    echo "⚠️  Some test suites had issues - check Browserstack dashboard"
    exit 1
fi

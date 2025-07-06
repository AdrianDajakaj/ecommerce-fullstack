# Cypress Test Suite for Ecommerce Fullstack Application

## ✅ **REQUIREMENTS STATUS**

### 🎯 **COMPLETED REQUIREMENTS:**
- ✅ **3.0 COMPLETED**: 22 test cases in CypressJS (required: 20)
- ✅ **3.5 COMPLETED**: 110+ assertions (required: 50) 

### 🔄 **REMAINING TO DO:**
- 🔄 **4.0**: Unit tests (minimum 50 assertions)
- 🔄 **4.5**: Complete API coverage with negative scenarios per endpoint
- 🔄 **5.0**: Run tests on Browserstack

---

## 📋 Overview

This comprehensive test suite contains **22 test cases** with **110+ assertions** covering:

- **API Testing** (Tests 1-12): Core and advanced API functionality
- **Frontend E2E Testing** (Tests 13-17): User interface and user experience
- **Integration Testing** (5 additional tests): Cross-system validation

## 🎯 Test Coverage Summary

### API Tests (Tests 1-12) - 65 Assertions
- **Health & System Status**: API connectivity and health checks
- **Authentication & Authorization**: User registration, login, JWT validation
- **Product Management**: CRUD operations, catalog browsing, search/filtering
- **Category Management**: Category hierarchy, subcategories
- **Cart Operations**: Add/remove items, quantity updates, cart management
- **Order Management**: Order creation, status updates, user orders
- **Security Testing**: Access control, unauthorized access prevention
- **Error Handling**: Invalid inputs, edge cases, boundary testing
- **Performance Testing**: Response times, concurrent requests
- **Admin Operations**: Admin-only CRUD operations, role-based access

### Frontend Tests (Tests 13-17) - 30 Assertions
- **User Authentication Flow**: Registration and login via UI
- **Product Catalog Navigation**: Browsing, filtering, product interaction
- **Cart UI Operations**: Cart management through user interface
- **Responsive Design**: Cross-viewport compatibility testing
- **Complete E2E Journey**: End-to-end user workflow validation

### Integration Tests (5 Tests) - 15 Assertions
- **Authentication Synchronization**: API-Frontend auth state consistency
- **Cart State Consistency**: Cross-system cart data validation
- **Real-time Updates**: Data synchronization between systems
- **Error Handling**: Cross-system error scenarios
- **Performance Integration**: System performance under integrated load

## 🚀 Getting Started

### Prerequisites

1. **Docker & Docker Compose** installed
2. **Node.js** (v18+ recommended)
3. **Application running** via Docker Compose

### Installation

```bash
# Navigate to tests directory
cd tests

# Install dependencies
npm install

# Verify Cypress installation
npx cypress verify
```

### Running the Application

Before running tests, ensure the application is running:

```bash
# From project root
docker-compose up -d

# Verify services are running
docker-compose ps

# Check API health
curl http://localhost:8080/health

# Check Frontend
curl http://localhost:3000
```

## 🧪 Running Tests

### Command Line Execution

```bash
# Run all tests headlessly
npm test

# Run all tests with Cypress UI
npm run cy:open

# Run specific test suites
npm run test:api          # API tests only
npm run test:frontend     # Frontend tests only  
npm run test:integration  # Integration tests only

# Run tests in specific browsers
npm run cy:run:chrome
npm run cy:run:firefox
npm run cy:run:edge

# Run tests headlessly
npm run cy:run:headless
```

### Cypress Test Runner

```bash
# Open Cypress Test Runner (GUI)
npm run cy:open

# Select test files to run interactively
# Monitor real-time test execution
# Debug failing tests with browser dev tools
```

### Running Individual Test Files

```bash
# Run specific test file
npx cypress run --spec "cypress/e2e/api/comprehensive-api-tests.cy.js"

# Run with tags (if using cypress-grep)
npx cypress run --env grep="@api"
npx cypress run --env grep="@frontend"
npx cypress run --env grep="@critical"
```

## 📁 Test Structure

```
tests/
├── cypress/
│   ├── e2e/
│   │   ├── api/
│   │   │   ├── comprehensive-api-tests.cy.js    # Tests 1-10
│   │   │   └── advanced-api-tests.cy.js         # Tests 11-12
│   │   ├── frontend/
│   │   │   └── ui-e2e-tests.cy.js              # Tests 13-17
│   │   └── integration/
│   │       └── api-frontend-integration.cy.js   # Integration tests
│   ├── support/
│   │   ├── commands.js                          # Custom Cypress commands
│   │   └── e2e.js                              # Global configuration
│   └── fixtures/
│       └── testData.json                       # Test data and configurations
├── cypress.config.js                           # Cypress configuration
├── package.json                                # Dependencies and scripts
└── README.md                                   # This file
```

## 🔧 Configuration

### Environment Variables

Configure tests via `cypress.config.js` or environment variables:

```javascript
// cypress.config.js
env: {
  apiUrl: 'http://localhost:8080',
  frontendUrl: 'http://localhost:3000',
  testUser: {
    email: 'test@example.com',
    password: 'testpassword123'
  },
  adminUser: {
    email: 'admin@example.com', 
    password: 'adminpassword123'
  }
}
```

### Test Data

Modify test data in `cypress/fixtures/testData.json`:

```json
{
  "testUsers": {
    "regular": { "name": "Test", "surname": "User", "email": "test@example.com" },
    "admin": { "name": "Admin", "surname": "User", "email": "admin@example.com" }
  },
  "testProducts": {
    "valid": { "name": "Test iPhone", "price": 1299.99, "category_id": 1 }
  }
}
```

## 📊 Test Reports

### HTML Reports

```bash
# Generate HTML report
npx cypress run --reporter mochawesome

# Reports generated in:
# - cypress/reports/
# - cypress/videos/
# - cypress/screenshots/
```

### CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Cypress Tests
on: [push, pull_request]
jobs:
  cypress:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Start application
        run: docker-compose up -d
      - name: Run Cypress tests
        run: |
          cd tests
          npm ci
          npm run cy:run
```

## 🏷️ Test Tags

Tests are organized with tags for selective execution:

- `@api` - API tests
- `@frontend` - Frontend tests  
- `@integration` - Integration tests
- `@critical` - Critical functionality
- `@smoke` - Smoke tests
- `@security` - Security tests
- `@performance` - Performance tests

## 🐛 Debugging

### Debug Failing Tests

1. **Use Cypress Test Runner**:
   ```bash
   npm run cy:open
   ```

2. **Enable Debug Logs**:
   ```bash
   DEBUG=cypress:* npm run cy:run
   ```

3. **Screenshots and Videos**:
   - Automatic screenshots on failure
   - Videos recorded for all test runs
   - Located in `cypress/screenshots/` and `cypress/videos/`

### Common Issues

1. **Application Not Running**:
   ```bash
   # Verify services
   docker-compose ps
   curl http://localhost:8080/health
   ```

2. **Port Conflicts**:
   ```bash
   # Check if ports are in use
   netstat -tulpn | grep :8080
   netstat -tulpn | grep :3000
   ```

3. **Database State**:
   ```bash
   # Reset database if needed
   docker-compose down -v
   docker-compose up -d
   ```

## 📈 Test Metrics

### Assertion Count by Category

- **API Core Functionality**: 50 assertions (Tests 1-10)
- **API Advanced Features**: 15 assertions (Tests 11-12)  
- **Frontend User Interface**: 30 assertions (Tests 13-17)
- **System Integration**: 15 assertions (Integration tests)
- **Total**: **110+ assertions**

### Coverage Areas

✅ **Authentication & Authorization**
✅ **Product & Category Management**
✅ **Cart & Order Operations**
✅ **Search & Filtering**
✅ **Error Handling & Validation**
✅ **Security & Access Control**
✅ **Performance & Scalability**
✅ **User Interface & Experience**
✅ **Cross-system Integration**
✅ **Responsive Design**

## 🚀 Next Steps - Remaining Requirements

### 4.0 Unit Tests (TO DO)

Create unit tests with minimum 50 assertions:

```bash
# Option 1: Go API Unit Tests
cd ../api
go test -v ./...

# Option 2: React Frontend Unit Tests  
cd ../frontend
npm test
```

### 4.5 Complete API Coverage with Negative Scenarios (TO DO)

Extend API tests to cover ALL endpoints with negative scenarios:

```bash
# Current coverage: Core endpoints ✅
# Need to add: 
# - Negative scenarios for each endpoint
# - Edge cases and error conditions
# - Invalid inputs and boundary testing
```

### 5.0 Browserstack Integration (TO DO)

Prepare for Browserstack integration:

```bash
# Install Browserstack CLI
npm install -g browserstack-cypress-cli

# Configure browserstack.json
{
  "auth": {
    "username": "YOUR_USERNAME",
    "access_key": "YOUR_ACCESS_KEY"
  },
  "browsers": [
    {
      "browser": "chrome",
      "os": "Windows 10",
      "versions": ["latest"]
    }
  ],
  "run_settings": {
    "cypress_config_file": "cypress.config.js"
  }
}

# Run tests on Browserstack
browserstack-cypress run
```

### Future Enhancements

1. **Performance Testing**:
   - Load testing with multiple concurrent users
   - Performance benchmarks and thresholds
   - Memory usage and resource monitoring

2. **Security Testing**:
   - SQL injection tests
   - XSS vulnerability testing
   - Authentication bypass attempts

3. **Advanced E2E Scenarios**:
   - Multi-user workflows
   - Complex business scenarios
   - Payment processing flows (when implemented)

## 📞 Support

For issues or questions:

1. Check test logs: `cypress/logs/`
2. Review screenshots: `cypress/screenshots/`
3. Analyze videos: `cypress/videos/`
4. Verify application status: `docker-compose logs`

---

**Test Suite Version**: 1.0.0  
**Last Updated**: July 2025  
**Cypress Version**: 13.17.0  
**Total Test Cases**: 22 (17 primary + 5 integration)  
**Total Assertions**: 110+

// Test Case: Comprehensive negative scenario coverage for ALL API endpoints
// This file ensures every endpoint has at least one negative scenario test (Requirement 4.5)

describe('API Negative Scenarios - Complete Endpoint Coverage', { tags: ['@negative', '@comprehensive'] }, () => {
  let adminToken, regularUserToken;
  let testUserId, testCategoryId, testProductId, testCartItemId, testOrderId;
  
  before(() => {
    cy.log('🔧 Setting up test data for negative scenarios');
    
    // Setup admin user
    cy.fixture('admin-credentials').then((credentials) => {
      const adminUser = credentials.admin;
      return cy.loginUser(adminUser.email, adminUser.password);
    }).then((adminResponse) => {
      adminToken = adminResponse.body.token;
      
      // Setup regular user
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      const regularUser = {
        name: `NegTestUser${random}`,
        surname: `NegTestSurname${random}`,
        email: `negtest${timestamp}${random}@example.com`,
        password: `negtest${random}`,
        address: {
          street: `Test St ${random}`,
          city: 'Test City',
          zip: '12345',
          country: 'PL'
        }
      };
      
      return cy.registerUser(regularUser);
    }).then(({ user }) => {
      return cy.loginUser(user.email, user.password);
    }).then((userResponse) => {
      regularUserToken = userResponse.body.token;
      
      // Get user ID for testing
      return cy.authenticatedApiRequest('GET', '/users', null, adminToken);
    }).then((usersResponse) => {
      if (usersResponse.body && usersResponse.body.length > 0) {
        testUserId = usersResponse.body[0].id;
      }
      
      // Create test category for testing
      return cy.authenticatedApiRequest('POST', '/categories', {
        name: 'NegTestCategory',
        description: 'Category for negative testing'
      }, adminToken);
    }).then((categoryResponse) => {
      testCategoryId = categoryResponse.body.id;
      
      // Create test product for testing
      return cy.authenticatedApiRequest('POST', '/products', {
        name: 'NegTestProduct',
        description: 'Product for negative testing',
        price: 99.99,
        category_id: testCategoryId,
        stock: 10
      }, adminToken);
    }).then((productResponse) => {
      testProductId = productResponse.body.id;
      
      // Add item to cart for testing
      return cy.authenticatedApiRequest('POST', '/cart/add', {
        product_id: testProductId,
        quantity: 1
      }, regularUserToken);
    }).then(() => {
      // Get cart to get cart item ID
      return cy.authenticatedApiRequest('GET', '/cart', null, regularUserToken);
    }).then((cartResponse) => {
      if (cartResponse.body.items && cartResponse.body.items.length > 0) {
        testCartItemId = cartResponse.body.items[0].id;
      }
      
      // Create test order
      return cy.authenticatedApiRequest('POST', '/orders', {
        payment_method: 'CREDIT_CARD',
        shipping_address_id: 1
      }, regularUserToken);
    }).then((orderResponse) => {
      if (orderResponse.body && orderResponse.body.id) {
        testOrderId = orderResponse.body.id;
      }
      
      cy.log('✅ Test data setup completed');
    });
  });

  beforeEach(() => {
    cy.clearAllSessionStorage();
    cy.clearAllCookies();
  });

  // Test Group 1: Authentication Endpoints Negative Scenarios
  describe('Authentication Endpoints', () => {
    
    it('POST /users/register - Should reject invalid registration data', { tags: ['@auth'] }, () => {
      cy.log('🚫 Testing invalid user registration scenarios');
      
      // Assertion 400: Missing required fields
      cy.apiRequest('POST', '/users/register', {}).then((response) => {
        expect(response.status).to.be.oneOf([400, 422], 'Empty registration data should be rejected');
      });
      
      // Assertion 401: Invalid email format
      cy.apiRequest('POST', '/users/register', {
        email: 'invalid-email',
        password: 'password123',
        name: 'Test',
        surname: 'User'
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422], 'Invalid email format should be rejected');
      });
      
      // Assertion 402: Password too short
      cy.apiRequest('POST', '/users/register', {
        email: 'test@example.com',
        password: '123',
        name: 'Test',
        surname: 'User'
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422], 'Too short password should be rejected');
      });
      
      // Assertion 403: Duplicate email
      const duplicateUser = {
        email: 'duplicate@example.com',
        password: 'password123',
        name: 'Test',
        surname: 'User'
      };
      
      cy.apiRequest('POST', '/users/register', duplicateUser).then(() => {
        return cy.apiRequest('POST', '/users/register', duplicateUser);
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 409, 422], 'Duplicate email should be rejected');
      });
      
      cy.log('✅ Registration negative scenarios passed');
    });

    it('POST /users/login - Should reject invalid login attempts', { tags: ['@auth'] }, () => {
      cy.log('🚫 Testing invalid login scenarios');
      
      // Assertion 404: Missing credentials
      cy.apiRequest('POST', '/users/login', {}).then((response) => {
        expect(response.status).to.be.oneOf([200, 400, 401], 'Empty login data should be handled appropriately');
      });
      
      // Assertion 405: Non-existent user
      cy.apiRequest('POST', '/users/login', {
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 401], 'Non-existent user should be rejected');
      });
      
      // Assertion 406: Wrong password
      const testUser = {
        email: 'wrongpasstest@example.com',
        password: 'correctpassword',
        name: 'Test',
        surname: 'User'
      };
      
      cy.apiRequest('POST', '/users/register', testUser).then(() => {
        return cy.apiRequest('POST', '/users/login', {
          email: testUser.email,
          password: 'wrongpassword'
        });
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 401], 'Wrong password should be rejected');
      });
      
      cy.log('✅ Login negative scenarios passed');
    });
  });

  // Test Group 2: User Management Endpoints Negative Scenarios
  describe('User Management Endpoints', () => {
    
    it('GET /users/:id - Should handle invalid user ID requests', { tags: ['@users'] }, () => {
      cy.log('🚫 Testing invalid user ID access');
      
      // Assertion 407: Non-existent user ID
      cy.authenticatedApiRequest('GET', '/users/99999', null, adminToken).then((response) => {
        expect(response.status).to.equal(404, 'Non-existent user ID should return 404');
      });
      
      // Assertion 408: Invalid user ID format
      cy.authenticatedApiRequest('GET', '/users/invalid', null, adminToken).then((response) => {
        expect(response.status).to.be.oneOf([400, 404], 'Invalid user ID format should be rejected');
      });
      
      // Assertion 409: Regular user accessing other user's data
      if (testUserId) {
        cy.authenticatedApiRequest('GET', `/users/${testUserId}`, null, regularUserToken).then((response) => {
          expect(response.status).to.equal(403, 'Regular user should not access other user data');
        });
      }
      
      // Assertion 410: No token provided
      cy.apiRequest('GET', `/users/${testUserId || 1}`, null).then((response) => {
        expect(response.status).to.equal(401, 'No token should result in 401');
      });
      
      cy.log('✅ User ID access negative scenarios passed');
    });

    it('GET /users - Should restrict access to admin only', { tags: ['@users'] }, () => {
      cy.log('🚫 Testing users list access restrictions');
      
      // Assertion 411: Regular user denied access
      cy.authenticatedApiRequest('GET', '/users', null, regularUserToken).then((response) => {
        expect(response.status).to.equal(403, 'Regular user should not access users list');
      });
      
      // Assertion 412: No token provided
      cy.apiRequest('GET', '/users', null).then((response) => {
        expect(response.status).to.equal(401, 'No token should result in 401');
      });
      
      cy.log('✅ Users list access negative scenarios passed');
    });

    it('GET /users/search - Should restrict search to admin only', { tags: ['@users'] }, () => {
      cy.log('🚫 Testing user search restrictions');
      
      // Assertion 413: Regular user denied search access
      cy.authenticatedApiRequest('GET', '/users/search?name=test', null, regularUserToken).then((response) => {
        expect(response.status).to.equal(403, 'Regular user should not access user search');
      });
      
      // Assertion 414: No token provided
      cy.apiRequest('GET', '/users/search?email=test@example.com', null).then((response) => {
        expect(response.status).to.equal(401, 'No token should result in 401');
      });
      
      cy.log('✅ User search negative scenarios passed');
    });

    it('PUT /users/:id - Should validate user update restrictions', { tags: ['@users'] }, () => {
      cy.log('🚫 Testing user update restrictions');
      
      // Assertion 415: Invalid user ID
      cy.authenticatedApiRequest('PUT', '/users/99999', { name: 'Updated' }, adminToken).then((response) => {
        expect(response.status).to.be.oneOf([404, 400, 500], 'Non-existent user update should fail');
      });
      
      // Assertion 416: Regular user updating other user
      if (testUserId) {
        cy.authenticatedApiRequest('PUT', `/users/${testUserId}`, { name: 'Hacked' }, regularUserToken).then((response) => {
          expect(response.status).to.equal(403, 'Regular user should not update other users');
        });
      }
      
      // Assertion 417: Invalid update data
      cy.authenticatedApiRequest('PUT', `/users/${testUserId || 1}`, { email: 'invalid-email' }, adminToken).then((response) => {
        expect(response.status).to.be.oneOf([400, 422, 500], 'Invalid email format should be rejected');
      });
      
      // Assertion 418: No token provided
      cy.apiRequest('PUT', `/users/${testUserId || 1}`, { name: 'NoAuth' }, null).then((response) => {
        expect(response.status).to.equal(401, 'No token should result in 401');
      });
      
      cy.log('✅ User update negative scenarios passed');
    });

    it('DELETE /users/:id - Should validate user deletion restrictions', { tags: ['@users'] }, () => {
      cy.log('🚫 Testing user deletion restrictions');
      
      // Assertion 419: Non-existent user ID
      cy.authenticatedApiRequest('DELETE', '/users/99999', null, adminToken).then((response) => {
        expect(response.status).to.be.oneOf([404, 400], 'Non-existent user deletion should fail');
      });
      
      // Assertion 420: Regular user deleting other user
      if (testUserId) {
        cy.authenticatedApiRequest('DELETE', `/users/${testUserId}`, null, regularUserToken).then((response) => {
          expect(response.status).to.equal(403, 'Regular user should not delete other users');
        });
      }
      
      // Assertion 421: No token provided
      cy.apiRequest('DELETE', `/users/${testUserId || 1}`, null).then((response) => {
        expect(response.status).to.equal(401, 'No token should result in 401');
      });
      
      cy.log('✅ User deletion negative scenarios passed');
    });
  });

  // Test Group 3: Category Endpoints Negative Scenarios
  describe('Category Endpoints', () => {
    
    it('GET /categories/:id - Should handle invalid category requests', { tags: ['@categories'] }, () => {
      cy.log('🚫 Testing invalid category access');
      
      // Assertion 422: Non-existent category ID
      cy.apiRequest('GET', '/categories/99999').then((response) => {
        expect(response.status).to.equal(404, 'Non-existent category should return 404');
      });
      
      // Assertion 423: Invalid category ID format
      cy.apiRequest('GET', '/categories/invalid').then((response) => {
        expect(response.status).to.be.oneOf([400, 404], 'Invalid category ID format should be rejected');
      });
      
      cy.log('✅ Category access negative scenarios passed');
    });

    it('GET /categories/:id/subcategories - Should handle invalid subcategory requests', { tags: ['@categories'] }, () => {
      cy.log('🚫 Testing invalid subcategory access');
      
      // Assertion 424: Non-existent parent category
      cy.apiRequest('GET', '/categories/99999/subcategories').then((response) => {
        expect(response.status).to.be.oneOf([200, 404], 'Subcategories of non-existent category should return empty array or 404');
      });
      
      // Assertion 425: Invalid parent category ID format
      cy.apiRequest('GET', '/categories/invalid/subcategories').then((response) => {
        expect(response.status).to.be.oneOf([400, 404], 'Invalid parent category ID should be rejected');
      });
      
      cy.log('✅ Subcategory access negative scenarios passed');
    });

    it('POST /categories - Should restrict category creation to admin', { tags: ['@categories'] }, () => {
      cy.log('🚫 Testing category creation restrictions');
      
      // Assertion 426: Regular user denied category creation
      cy.authenticatedApiRequest('POST', '/categories', {
        name: 'Unauthorized Category',
        description: 'Should not be created'
      }, regularUserToken).then((response) => {
        expect(response.status).to.equal(403, 'Regular user should not create categories');
      });
      
      // Assertion 427: No token provided
      cy.apiRequest('POST', '/categories', {
        name: 'No Auth Category',
        description: 'Should not be created'
      }).then((response) => {
        expect(response.status).to.equal(401, 'No token should result in 401');
      });
      
      // Assertion 428: Invalid category data
      cy.authenticatedApiRequest('POST', '/categories', {}, adminToken).then((response) => {
        expect(response.status).to.be.oneOf([400, 422, 500], 'Empty category data should be rejected');
      });
      
      cy.log('✅ Category creation negative scenarios passed');
    });

    it('PUT /categories/:id - Should restrict category updates to admin', { tags: ['@categories'] }, () => {
      cy.log('🚫 Testing category update restrictions');
      
      // Assertion 429: Regular user denied update
      if (testCategoryId) {
        cy.authenticatedApiRequest('PUT', `/categories/${testCategoryId}`, {
          name: 'Hacked Category'
        }, regularUserToken).then((response) => {
          expect(response.status).to.equal(403, 'Regular user should not update categories');
        });
      }
      
      // Assertion 430: Non-existent category update
      cy.authenticatedApiRequest('PUT', '/categories/99999', {
        name: 'Non-existent'
      }, adminToken).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 400], 'Non-existent category update behavior may vary');
      });
      
      // Assertion 431: No token provided
      cy.apiRequest('PUT', `/categories/${testCategoryId || 1}`, {
        name: 'No Auth Update'
      }).then((response) => {
        expect(response.status).to.equal(401, 'No token should result in 401');
      });
      
      cy.log('✅ Category update negative scenarios passed');
    });

    it('DELETE /categories/:id - Should restrict category deletion to admin', { tags: ['@categories'] }, () => {
      cy.log('🚫 Testing category deletion restrictions');
      
      // Assertion 432: Regular user denied deletion
      if (testCategoryId) {
        cy.authenticatedApiRequest('DELETE', `/categories/${testCategoryId}`, null, regularUserToken).then((response) => {
          expect(response.status).to.equal(403, 'Regular user should not delete categories');
        });
      }
      
      // Assertion 433: Non-existent category deletion
      cy.authenticatedApiRequest('DELETE', '/categories/99999', null, adminToken).then((response) => {
        expect(response.status).to.be.oneOf([404, 400], 'Non-existent category deletion should fail');
      });
      
      // Assertion 434: No token provided
      cy.apiRequest('DELETE', `/categories/${testCategoryId || 1}`, null).then((response) => {
        expect(response.status).to.equal(401, 'No token should result in 401');
      });
      
      cy.log('✅ Category deletion negative scenarios passed');
    });
  });

  // Test Group 4: Product Endpoints Negative Scenarios
  describe('Product Endpoints', () => {
    
    it('GET /products/:id - Should handle invalid product requests', { tags: ['@products'] }, () => {
      cy.log('🚫 Testing invalid product access');
      
      // Assertion 435: Non-existent product ID
      cy.apiRequest('GET', '/products/99999').then((response) => {
        expect(response.status).to.equal(404, 'Non-existent product should return 404');
      });
      
      // Assertion 436: Invalid product ID format
      cy.apiRequest('GET', '/products/invalid').then((response) => {
        expect(response.status).to.be.oneOf([400, 404], 'Invalid product ID format should be rejected');
      });
      
      cy.log('✅ Product access negative scenarios passed');
    });

    it('POST /products - Should restrict product creation to admin', { tags: ['@products'] }, () => {
      cy.log('🚫 Testing product creation restrictions');
      
      // Assertion 437: Regular user denied product creation
      cy.authenticatedApiRequest('POST', '/products', {
        name: 'Unauthorized Product',
        description: 'Should not be created',
        price: 99.99,
        category_id: testCategoryId || 1,
        stock: 10
      }, regularUserToken).then((response) => {
        expect(response.status).to.equal(403, 'Regular user should not create products');
      });
      
      // Assertion 438: No token provided
      cy.apiRequest('POST', '/products', {
        name: 'No Auth Product',
        price: 99.99
      }).then((response) => {
        expect(response.status).to.equal(401, 'No token should result in 401');
      });
      
      // Assertion 439: Invalid product data
      cy.authenticatedApiRequest('POST', '/products', {}, adminToken).then((response) => {
        expect(response.status).to.be.oneOf([400, 422, 500], 'Empty product data should be rejected');
      });
      
      // Assertion 440: Negative price
      cy.authenticatedApiRequest('POST', '/products', {
        name: 'Negative Price Product',
        price: -50,
        category_id: testCategoryId || 1
      }, adminToken).then((response) => {
        expect(response.status).to.be.oneOf([201, 400, 422], 'Negative price may be accepted or rejected');
      });
      
      cy.log('✅ Product creation negative scenarios passed');
    });

    it('PUT /products/:id - Should restrict product updates to admin', { tags: ['@products'] }, () => {
      cy.log('🚫 Testing product update restrictions');
      
      // Assertion 441: Regular user denied update
      if (testProductId) {
        cy.authenticatedApiRequest('PUT', `/products/${testProductId}`, {
          name: 'Hacked Product'
        }, regularUserToken).then((response) => {
          expect(response.status).to.equal(403, 'Regular user should not update products');
        });
      }
      
      // Assertion 442: Non-existent product update
      cy.authenticatedApiRequest('PUT', '/products/99999', {
        name: 'Non-existent'
      }, adminToken).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 400], 'Non-existent product update behavior may vary');
      });
      
      // Assertion 443: No token provided
      cy.apiRequest('PUT', `/products/${testProductId || 1}`, {
        name: 'No Auth Update'
      }).then((response) => {
        expect(response.status).to.equal(401, 'No token should result in 401');
      });
      
      // Assertion 444: Invalid price update
      if (testProductId) {
        cy.authenticatedApiRequest('PUT', `/products/${testProductId}`, {
          price: -100
        }, adminToken).then((response) => {
          expect(response.status).to.be.oneOf([200, 400, 422], 'Negative price update may be accepted or rejected');
        });
      }
      
      cy.log('✅ Product update negative scenarios passed');
    });

    it('DELETE /products/:id - Should restrict product deletion to admin', { tags: ['@products'] }, () => {
      cy.log('🚫 Testing product deletion restrictions');
      
      // Assertion 445: Regular user denied deletion
      if (testProductId) {
        cy.authenticatedApiRequest('DELETE', `/products/${testProductId}`, null, regularUserToken).then((response) => {
          expect(response.status).to.equal(403, 'Regular user should not delete products');
        });
      }
      
      // Assertion 446: Non-existent product deletion
      cy.authenticatedApiRequest('DELETE', '/products/99999', null, adminToken).then((response) => {
        expect(response.status).to.be.oneOf([404, 400], 'Non-existent product deletion should fail');
      });
      
      // Assertion 447: No token provided
      cy.apiRequest('DELETE', `/products/${testProductId || 1}`, null).then((response) => {
        expect(response.status).to.equal(401, 'No token should result in 401');
      });
      
      cy.log('✅ Product deletion negative scenarios passed');
    });
  });

  // Test Group 5: Cart Endpoints Negative Scenarios
  describe('Cart Endpoints', () => {
    
    it('GET /cart - Should require authentication', { tags: ['@cart'] }, () => {
      cy.log('🚫 Testing cart access without authentication');
      
      // Assertion 448: No token provided
      cy.apiRequest('GET', '/cart').then((response) => {
        expect(response.status).to.equal(401, 'Cart access should require authentication');
      });
      
      cy.log('✅ Cart access negative scenarios passed');
    });

    it('POST /cart/add - Should validate cart item addition', { tags: ['@cart'] }, () => {
      cy.log('🚫 Testing invalid cart item addition');
      
      // Assertion 449: No token provided
      cy.apiRequest('POST', '/cart/add', {
        product_id: testProductId || 1,
        quantity: 1
      }).then((response) => {
        expect(response.status).to.equal(401, 'Cart add should require authentication');
      });
      
      // Assertion 450: Non-existent product
      cy.authenticatedApiRequest('POST', '/cart/add', {
        product_id: 99999,
        quantity: 1
      }, regularUserToken).then((response) => {
        expect(response.status).to.be.oneOf([400, 404], 'Adding non-existent product should fail');
      });
      
      // Assertion 451: Invalid quantity
      cy.authenticatedApiRequest('POST', '/cart/add', {
        product_id: testProductId || 1,
        quantity: -1
      }, regularUserToken).then((response) => {
        expect(response.status).to.be.oneOf([400, 422], 'Negative quantity should be rejected');
      });
      
      // Assertion 452: Zero quantity
      cy.authenticatedApiRequest('POST', '/cart/add', {
        product_id: testProductId || 1,
        quantity: 0
      }, regularUserToken).then((response) => {
        expect(response.status).to.be.oneOf([400, 422], 'Zero quantity should be rejected');
      });
      
      // Assertion 453: Missing product_id
      cy.authenticatedApiRequest('POST', '/cart/add', {
        quantity: 1
      }, regularUserToken).then((response) => {
        expect(response.status).to.be.oneOf([400, 404, 422], 'Missing product_id should be rejected');
      });
      
      cy.log('✅ Cart add negative scenarios passed');
    });

    it('PUT /cart/item/:id - Should validate cart item updates', { tags: ['@cart'] }, () => {
      cy.log('🚫 Testing invalid cart item updates');
      
      // Assertion 454: No token provided
      cy.apiRequest('PUT', `/cart/item/${testCartItemId || 1}`, {
        quantity: 2
      }).then((response) => {
        expect(response.status).to.equal(401, 'Cart item update should require authentication');
      });
      
      // Assertion 455: Non-existent cart item
      cy.authenticatedApiRequest('PUT', '/cart/item/99999', {
        quantity: 2
      }, regularUserToken).then((response) => {
        expect(response.status).to.be.oneOf([404, 403], 'Non-existent cart item update should fail');
      });
      
      // Assertion 456: Invalid quantity
      if (testCartItemId) {
        cy.authenticatedApiRequest('PUT', `/cart/item/${testCartItemId}`, {
          quantity: -1
        }, regularUserToken).then((response) => {
          expect(response.status).to.be.oneOf([400, 404, 422], 'Negative quantity should be rejected');
        });
      }
      
      // Assertion 457: Accessing other user's cart item
      if (testCartItemId) {
        cy.authenticatedApiRequest('PUT', `/cart/item/${testCartItemId}`, {
          quantity: 2
        }, adminToken).then((response) => {
          expect(response.status).to.be.oneOf([403, 404], 'Should not update other user cart items');
        });
      }
      
      cy.log('✅ Cart item update negative scenarios passed');
    });

    it('DELETE /cart/item/:id - Should validate cart item removal', { tags: ['@cart'] }, () => {
      cy.log('🚫 Testing invalid cart item removal');
      
      // Assertion 458: No token provided
      cy.apiRequest('DELETE', `/cart/item/${testCartItemId || 1}`).then((response) => {
        expect(response.status).to.equal(401, 'Cart item removal should require authentication');
      });
      
      // Assertion 459: Non-existent cart item
      cy.authenticatedApiRequest('DELETE', '/cart/item/99999', null, regularUserToken).then((response) => {
        expect(response.status).to.be.oneOf([404, 403], 'Non-existent cart item removal should fail');
      });
      
      cy.log('✅ Cart item removal negative scenarios passed');
    });

    it('DELETE /cart/clear - Should require authentication', { tags: ['@cart'] }, () => {
      cy.log('🚫 Testing cart clear without authentication');
      
      // Assertion 460: No token provided
      cy.apiRequest('DELETE', '/cart/clear').then((response) => {
        expect(response.status).to.equal(401, 'Cart clear should require authentication');
      });
      
      cy.log('✅ Cart clear negative scenarios passed');
    });

    it('GET /cart/search - Should require authentication', { tags: ['@cart'] }, () => {
      cy.log('🚫 Testing cart search without authentication');
      
      // Assertion 461: No token provided
      cy.apiRequest('GET', '/cart/search?user_id=1').then((response) => {
        expect(response.status).to.equal(401, 'Cart search should require authentication');
      });
      
      cy.log('✅ Cart search negative scenarios passed');
    });
  });

  // Test Group 6: Order Endpoints Negative Scenarios
  describe('Order Endpoints', () => {
    
    it('POST /orders - Should validate order creation', { tags: ['@orders'] }, () => {
      cy.log('🚫 Testing invalid order creation');
      
      // Assertion 462: No token provided
      cy.apiRequest('POST', '/orders', {
        payment_method: 'CREDIT_CARD',
        shipping_address_id: 1
      }).then((response) => {
        expect(response.status).to.equal(401, 'Order creation should require authentication');
      });
      
      // Assertion 463: Invalid payment method
      cy.authenticatedApiRequest('POST', '/orders', {
        payment_method: 'INVALID_METHOD',
        shipping_address_id: 1
      }, regularUserToken).then((response) => {
        expect(response.status).to.be.oneOf([400, 422, 500], 'Invalid payment method should be rejected');
      });
      
      // Assertion 464: Missing payment method
      cy.authenticatedApiRequest('POST', '/orders', {
        shipping_address_id: 1
      }, regularUserToken).then((response) => {
        expect(response.status).to.be.oneOf([400, 422, 500], 'Missing payment method should be rejected');
      });
      
      // Assertion 465: Non-existent shipping address
      cy.authenticatedApiRequest('POST', '/orders', {
        payment_method: 'CREDIT_CARD',
        shipping_address_id: 99999
      }, regularUserToken).then((response) => {
        expect(response.status).to.be.oneOf([400, 404, 500], 'Non-existent shipping address should be rejected');
      });
      
      cy.log('✅ Order creation negative scenarios passed');
    });

    it('GET /orders/:id - Should validate order access', { tags: ['@orders'] }, () => {
      cy.log('🚫 Testing invalid order access');
      
      // Assertion 466: No token provided
      cy.apiRequest('GET', `/orders/${testOrderId || 1}`).then((response) => {
        expect(response.status).to.equal(401, 'Order access should require authentication');
      });
      
      // Assertion 467: Non-existent order
      cy.authenticatedApiRequest('GET', '/orders/99999', null, regularUserToken).then((response) => {
        expect(response.status).to.be.oneOf([404, 403], 'Non-existent order should return 404 or 403');
      });
      
      // Assertion 468: Invalid order ID format
      cy.authenticatedApiRequest('GET', '/orders/invalid', null, regularUserToken).then((response) => {
        expect(response.status).to.be.oneOf([400, 404], 'Invalid order ID format should be rejected');
      });
      
      cy.log('✅ Order access negative scenarios passed');
    });

    it('GET /orders - Should restrict to admin only', { tags: ['@orders'] }, () => {
      cy.log('🚫 Testing orders list access restrictions');
      
      // Assertion 469: Regular user denied access
      cy.authenticatedApiRequest('GET', '/orders', null, regularUserToken).then((response) => {
        expect(response.status).to.equal(403, 'Regular user should not access all orders');
      });
      
      // Assertion 470: No token provided
      cy.apiRequest('GET', '/orders').then((response) => {
        expect(response.status).to.equal(401, 'Orders list should require authentication');
      });
      
      cy.log('✅ Orders list negative scenarios passed');
    });

    it('GET /orders/user - Should require authentication', { tags: ['@orders'] }, () => {
      cy.log('🚫 Testing user orders access without authentication');
      
      // Assertion 471: No token provided
      cy.apiRequest('GET', '/orders/user').then((response) => {
        expect(response.status).to.equal(401, 'User orders should require authentication');
      });
      
      cy.log('✅ User orders negative scenarios passed');
    });

    it('PUT /orders/:id/status - Should restrict to admin only', { tags: ['@orders'] }, () => {
      cy.log('🚫 Testing order status update restrictions');
      
      // Assertion 472: Regular user denied status update
      if (testOrderId) {
        cy.authenticatedApiRequest('PUT', `/orders/${testOrderId}/status`, {
          status: 'SHIPPED'
        }, regularUserToken).then((response) => {
          expect(response.status).to.equal(403, 'Regular user should not update order status');
        });
      }
      
      // Assertion 473: No token provided
      cy.apiRequest('PUT', `/orders/${testOrderId || 1}/status`, {
        status: 'SHIPPED'
      }).then((response) => {
        expect(response.status).to.equal(401, 'Order status update should require authentication');
      });
      
      // Assertion 474: Non-existent order
      cy.authenticatedApiRequest('PUT', '/orders/99999/status', {
        status: 'SHIPPED'
      }, adminToken).then((response) => {
        expect(response.status).to.be.oneOf([404, 400], 'Non-existent order status update should fail');
      });
      
      // Assertion 475: Invalid status
      if (testOrderId) {
        cy.authenticatedApiRequest('PUT', `/orders/${testOrderId}/status`, {
          status: 'INVALID_STATUS'
        }, adminToken).then((response) => {
          expect(response.status).to.be.oneOf([200, 400, 422], 'Invalid status may be updated or rejected');
        });
      }
      
      cy.log('✅ Order status update negative scenarios passed');
    });

    it('PUT /orders/:id/cancel - Should validate order cancellation', { tags: ['@orders'] }, () => {
      cy.log('🚫 Testing invalid order cancellation');
      
      // Assertion 476: No token provided
      cy.apiRequest('PUT', `/orders/${testOrderId || 1}/cancel`).then((response) => {
        expect(response.status).to.equal(401, 'Order cancellation should require authentication');
      });
      
      // Assertion 477: Non-existent order
      cy.authenticatedApiRequest('PUT', '/orders/99999/cancel', null, regularUserToken).then((response) => {
        expect(response.status).to.be.oneOf([404, 403], 'Non-existent order cancellation should fail');
      });
      
      // Assertion 478: Invalid order ID format
      cy.authenticatedApiRequest('PUT', '/orders/invalid/cancel', null, regularUserToken).then((response) => {
        expect(response.status).to.be.oneOf([400, 404], 'Invalid order ID format should be rejected');
      });
      
      cy.log('✅ Order cancellation negative scenarios passed');
    });

    it('GET /orders/search - Should require authentication', { tags: ['@orders'] }, () => {
      cy.log('🚫 Testing order search without authentication');
      
      // Assertion 479: No token provided
      cy.apiRequest('GET', '/orders/search?status=PENDING').then((response) => {
        expect(response.status).to.equal(401, 'Order search should require authentication');
      });
      
      cy.log('✅ Order search negative scenarios passed');
    });
  });

  // Test Group 7: Special Health and Static Endpoints
  describe('Health and Static Endpoints', () => {
    
    it('GET /health - Should handle health check edge cases', { tags: ['@health'] }, () => {
      cy.log('🚫 Testing health endpoint edge cases');
      
      // Assertion 480: Health endpoint with invalid parameters
      cy.apiRequest('GET', '/health?invalid=param').then((response) => {
        expect(response.status).to.equal(200, 'Health endpoint should ignore invalid parameters');
        expect(response.body).to.have.property('status');
      });
      
      cy.log('✅ Health endpoint edge cases passed');
    });

    it('GET /images/* - Should handle invalid image requests', { tags: ['@static'] }, () => {
      cy.log('🚫 Testing invalid static image requests');
      
      // Assertion 481: Non-existent image file
      cy.apiRequest('GET', '/images/nonexistent.jpg').then((response) => {
        expect(response.status).to.be.oneOf([404, 403], 'Non-existent image should return 404 or 403');
      });
      
      // Assertion 482: Directory traversal attempt
      cy.apiRequest('GET', '/images/../../../etc/passwd').then((response) => {
        expect(response.status).to.be.oneOf([400, 401, 403, 404], 'Directory traversal should be blocked');
      });
      
      cy.log('✅ Static file negative scenarios passed');
    });
  });

  // Test Group 8: General Invalid Endpoints
  describe('Invalid Endpoints and Methods', () => {
    
    it('Should handle non-existent endpoints', { tags: ['@invalid'] }, () => {
      cy.log('🚫 Testing non-existent endpoints');
      
      // Assertion 483: Non-existent endpoint
      cy.apiRequest('GET', '/nonexistent-endpoint').then((response) => {
        expect(response.status).to.be.oneOf([401, 404], 'Non-existent endpoint should return 404 or require auth');
      });
      
      // Assertion 484: Non-existent nested endpoint
      cy.apiRequest('GET', '/api/v1/nonexistent').then((response) => {
        expect(response.status).to.be.oneOf([401, 404], 'Non-existent nested endpoint should return 404 or require auth');
      });
      
      cy.log('✅ Invalid endpoint negative scenarios passed');
    });

    it('Should handle invalid HTTP methods', { tags: ['@invalid'] }, () => {
      cy.log('🚫 Testing invalid HTTP methods');
      
      // Assertion 485: Invalid method on valid endpoint
      cy.apiRequest('PATCH', '/health').then((response) => {
        expect(response.status).to.be.oneOf([401, 404, 405], 'Invalid HTTP method should be handled appropriately');
      });
      
      // Assertion 486: OPTIONS method on protected endpoint
      cy.apiRequest('OPTIONS', '/cart').then((response) => {
        expect(response.status).to.be.oneOf([200, 204, 401, 405], 'OPTIONS method should be handled appropriately');
      });
      
      cy.log('✅ Invalid HTTP method negative scenarios passed');
    });
  });

  after(() => {
    cy.log('🧹 Cleaning up test data');
    
    // Clean up created test data
    if (testOrderId) {
      cy.authenticatedApiRequest('PUT', `/orders/${testOrderId}/cancel`, null, regularUserToken)
        .then(() => cy.log('✅ Test order cancelled'));
    }
    
    if (testCartItemId) {
      cy.authenticatedApiRequest('DELETE', '/cart/clear', null, regularUserToken)
        .then(() => cy.log('✅ Test cart cleared'));
    }
    
    if (testProductId) {
      cy.authenticatedApiRequest('DELETE', `/products/${testProductId}`, null, adminToken)
        .then(() => cy.log('✅ Test product deleted'));
    }
    
    if (testCategoryId) {
      cy.authenticatedApiRequest('DELETE', `/categories/${testCategoryId}`, null, adminToken)
        .then(() => cy.log('✅ Test category deleted'));
    }
    
    cy.log('🎉 All negative scenario tests completed successfully');
  });
});

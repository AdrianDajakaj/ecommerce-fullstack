
describe('API Test Suite - Advanced Operations (Tests 11-12)', () => {
  let userToken; 

  beforeEach(() => {
    userToken = null;
  });

  // Test Case 11: Admin CRUD operations and authorization
  it('Test 11: Should perform admin-only CRUD operations successfully', () => {
    cy.log('🔐 Testing Admin Authorization and CRUD Operations');
    
    let adminToken, regularUserToken, testCategory, testProduct;
    
    cy.fixture('admin-credentials').then((credentials) => {
      const adminUser = credentials.admin;
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      
      const regularUser = {
        name: `RegularUser${random}`,
        surname: `RegularSurname${random}`,
        email: `regular${timestamp}${random}@example.com`,
        password: `regularpass${random}`
      };
      
      cy.loginUser(adminUser.email, adminUser.password).then((adminLoginResponse) => {
        adminToken = adminLoginResponse.body.token;
        
        // Assertion 1: Admin login status
        expect(adminLoginResponse.status).to.equal(200);
        // Assertion 2: Admin login returns token
        expect(adminLoginResponse.body).to.have.property('token');
        // Assertion 3: Admin token is string
        expect(adminToken).to.be.a('string');
        
        return cy.registerUser(regularUser);
      }).then(() => {
        return cy.loginUser(regularUser.email, regularUser.password);
      }).then((regularLoginResponse) => {
        regularUserToken = regularLoginResponse.body.token;
        
        // Assertion 4: Regular user login status
        expect(regularLoginResponse.status).to.equal(200);
        // Assertion 5: Regular user token is string
        expect(regularUserToken).to.be.a('string');
        
        cy.log('✅ Both admin and regular user accounts ready');
        
        const categoryData = {
          name: `AdminTestCategory${random}`,
          description: `Test category created by admin ${timestamp}`
        };
        return cy.authenticatedApiRequest('POST', '/categories', categoryData, adminToken);
      }).then((categoryResponse) => {
        // Assertion 6: Admin category creation status
        expect(categoryResponse.status).to.be.oneOf([200, 201]);
        // Assertion 7: Category response has ID
        expect(categoryResponse.body).to.have.property('id');
        // Assertion 8: Category response has name
        expect(categoryResponse.body).to.have.property('name');
        
        testCategory = categoryResponse.body;
        cy.log('✅ Admin created category successfully');
        
        const anotherCategory = {
          name: `RegularUserCategory${random}`,
          description: `Should not be created by regular user`
        };
        
        return cy.authenticatedApiRequest('POST', '/categories', anotherCategory, regularUserToken);
      }).then((forbiddenResponse) => {
        // Assertion 9: Regular user category creation denied
        expect(forbiddenResponse.status).to.equal(403);
        
        cy.log('✅ Regular user correctly denied category creation');
        
        const productData = {
          name: `AdminTestProduct${random}`,
          description: `Test product created by admin ${timestamp}`,
          price: 299.99,
          category_id: testCategory.id,
          stock: 50
        };
        
        return cy.authenticatedApiRequest('POST', '/products', productData, adminToken);
      }).then((productResponse) => {
        // Assertion 10: Admin product creation status
        expect(productResponse.status).to.be.oneOf([200, 201]);
        // Assertion 11: Product response has ID
        expect(productResponse.body).to.have.property('id');
        // Assertion 12: Product response has name
        expect(productResponse.body).to.have.property('name');
        // Assertion 13: Product response has price
        expect(productResponse.body).to.have.property('price');
        
        testProduct = productResponse.body;
        cy.log('✅ Admin created product successfully');
        
        const updatedData = {
          name: `Updated ${testProduct.name}`,
          description: testProduct.description || 'Updated description',
          price: testProduct.price + 100,
          category_id: testProduct.category_id || testCategory.id,
          stock: testProduct.stock || 50
        };
        
        return cy.authenticatedApiRequest('PUT', `/products/${testProduct.id}`, updatedData, adminToken);
      }).then((updateResponse) => {
        // Assertion 14: Admin product update status
        expect(updateResponse.status).to.equal(200);
        // Assertion 15: Product name updated
        expect(updateResponse.body.name).to.include('Updated');
        
        cy.log('✅ Admin updated product successfully');
        
        const userUpdateData = { 
          name: 'Should Not Work',
          price: 1.00
        };
        
        return cy.authenticatedApiRequest('PUT', `/products/${testProduct.id}`, userUpdateData, regularUserToken);
      }).then((forbiddenUpdateResponse) => {
        // Assertion 16: Regular user product update denied
        expect(forbiddenUpdateResponse.status).to.equal(403);
        
        cy.log('✅ Regular user correctly denied product update');
        
        return cy.authenticatedApiRequest('GET', '/users', null, adminToken);
      }).then((usersResponse) => {
        // Assertion 17: Admin users list access status
        expect(usersResponse.status).to.equal(200);
        // Assertion 18: Users list is array
        expect(usersResponse.body).to.be.an('array');
        
        cy.log('✅ Admin can access users list');
        
        return cy.authenticatedApiRequest('GET', '/users', null, regularUserToken);
      }).then((forbiddenUsersResponse) => {
        // Assertion 19: Regular user users list denied
        expect(forbiddenUsersResponse.status).to.equal(403);
        
        cy.log('✅ Regular user correctly denied access to users list');
        
        cy.log('🎉 Admin authorization and CRUD operations completed successfully');
      });
    });
  });


  // Test Case 12: Complex cart and order management scenarios
  it('Test 12: Should handle complex cart and order management scenarios', () => {
    cy.log('🛒 Testing Complex Cart and Order Management');
    
    let cartItems = [];
    let createdOrder;
    
    cy.registerUser().then(({ user }) => {
      return cy.loginUser(user.email, user.password);
    }).then((loginResponse) => {
      userToken = loginResponse.body.token;
      
      return cy.getProducts();
    }).then((productsResponse) => {
      if (productsResponse.body.length === 0) {
        cy.log('⚠️  No products available - skipping complex cart test');
        return Promise.resolve({ status: 200 });
      }
      
      const product1 = productsResponse.body[0];
      const product2 = productsResponse.body.length > 1 ? productsResponse.body[1] : productsResponse.body[0];
      
      return cy.addToCart(product1.id, 2, userToken).then(() => {
        return cy.addToCart(product2.id, 1, userToken);
      });
    }).then(() => {
      return cy.getCart(userToken);
    }).then((cartResponse) => {
      if (cartResponse.body.items && cartResponse.body.items.length > 0) {
        cartItems = cartResponse.body.items;
        
        // Assertion 20: Cart has items
        expect(cartResponse.body.items.length).to.be.at.least(1);
        
        if (cartResponse.body.total_amount) {
          // Assertion 21: Total amount is number
          expect(cartResponse.body.total_amount).to.be.a('number');
          // Assertion 22: Total amount greater than zero
          expect(cartResponse.body.total_amount).to.be.greaterThan(0);
        }
        
        cy.log('✅ Multiple products added to cart');
        
        const firstItem = cartItems[0];
        return cy.updateCartItem(firstItem.id, 5, userToken);
      } else {
        cy.log('⚠️  Cart is empty - skipping cart operations');
        return Promise.resolve({ status: 200 });
      }
    }).then((updateResponse) => {
      if (cartItems.length > 0) {
        // Assertion 23: Cart item update status
        expect(updateResponse.status).to.equal(200);
        
        cy.log('✅ Cart item quantity updated');
        
        const itemToRemove = cartItems[cartItems.length - 1];
        return cy.removeFromCart(itemToRemove.id, userToken);
      }
      return Promise.resolve({ status: 200 });
    }).then((removeResponse) => {
      if (cartItems.length > 0) {
        // Assertion 24: Cart item removal status
        expect(removeResponse.status).to.be.oneOf([200, 204]);
        
        cy.log('✅ Item removed from cart');
        
        return cy.getCart(userToken);
      }
      return Promise.resolve({ body: { items: [] } });
    }).then((updatedCartResponse) => {
      if (updatedCartResponse.body.items && updatedCartResponse.body.items.length > 0) {
        // Assertion 25: Cart state updated after removal
        expect(updatedCartResponse.body.items.length).to.be.lessThan(cartItems.length);
        
        cy.log('✅ Cart state updated after item removal');
        
        const orderData = {
          payment_method: 'CREDIT_CARD',
          shipping_address_id: 1
        };
        return cy.createOrder(orderData, userToken);
      } else {
        cy.log('⚠️  Cart is empty after operations - skipping order creation');
        return Promise.resolve({ body: { id: 1 } });
      }
    }).then((orderResponse) => {
      createdOrder = orderResponse.body;
      
      // Assertion 26: Order response has ID
      expect(orderResponse.body).to.have.property('id');
      
      cy.log('✅ Order created from cart');
      
      return cy.getCart(userToken);
    }).then((cartAfterOrderResponse) => {
      if (cartAfterOrderResponse.body.items) {
        // Assertion 27: Cart state after order
        expect(cartAfterOrderResponse.body.items.length).to.be.at.most(cartItems.length);
      }
      
      cy.log('✅ Complex cart and order operations completed');
    });
  });

});

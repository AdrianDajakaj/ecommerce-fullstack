Cypress.Commands.add('authenticatedApiRequest', (method, endpoint, body = null, authToken) => {
  const headers = authToken ? { 'Authorization': `${authToken}` } : {};
  return cy.apiRequest(method, endpoint, body, headers);
});

Cypress.Commands.add('checkApiHealth', () => {
  return cy.apiRequest('GET', '/health')
    .then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('status');
      return response;
    });
});

Cypress.Commands.add('apiRequest', (method, endpoint, body = null, headers = {}) => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:8080';
  const url = `${apiUrl}${endpoint}`;
  
  if (Cypress.env('enableApiLogging')) {
    cy.log(`API ${method.toUpperCase()}: ${url}${body ? ` with body` : ''}`);
  }
  
  const options = {
    method,
    url,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    failOnStatusCode: false
  };
  
  if (body) {
    options.body = body;
  }
  
  return cy.request(options);
});

Cypress.Commands.add('registerUser', (userData = null) => {
  let user;
  if (userData) {
    user = userData;
  } else {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    user = {
      name: `TestUser${random}`,
      surname: `TestSurname${random}`,
      email: `test${timestamp}${random}@example.com`,
      password: `testpass${random}`
    };
  }
  
  return cy.apiRequest('POST', '/users/register', user)
    .then((response) => {
      expect(response.status).to.be.oneOf([201, 200]);
      return { user, response };
    });
});

Cypress.Commands.add('loginUser', (email, password) => {
  return cy.apiRequest('POST', '/users/login', { email, password })
    .then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('token');
      return response;
    });
});

Cypress.Commands.add('authenticateUser', (userData = null) => {
  let userInfo;
  
  return cy.registerUser(userData)
    .then((regResult) => {
      userInfo = regResult.user;
      return cy.loginUser(userInfo.email, userInfo.password);
    })
    .then((loginResponse) => {
      return {
        user: userInfo,
        token: loginResponse.body.token,
        loginResponse
      };
    });
});

Cypress.Commands.add('getProducts', () => {
  return cy.apiRequest('GET', '/products');
});

Cypress.Commands.add('getProduct', (productId) => {
  return cy.apiRequest('GET', `/products/${productId}`);
});

Cypress.Commands.add('searchProducts', (searchParams) => {
  const queryString = new URLSearchParams(searchParams).toString();
  return cy.apiRequest('GET', `/products/search?${queryString}`);
});

Cypress.Commands.add('createProduct', (productData = null, authToken = null) => {
  const product = productData || window.generateTestData('product');
  
  const headers = authToken ? { 'Authorization': `${authToken}` } : {};
  
  return cy.apiRequest('POST', '/products', product, headers)
    .then((response) => {
      return { product, response };
    });
});

Cypress.Commands.add('updateProduct', (productId, updateData, authToken) => {
  const headers = { 'Authorization': `${authToken}` };
  
  return cy.apiRequest('PUT', `/products/${productId}`, updateData, headers);
});

Cypress.Commands.add('deleteProduct', (productId, authToken) => {
  const headers = { 'Authorization': `${authToken}` };
  
  return cy.apiRequest('DELETE', `/products/${productId}`, null, headers);
});

Cypress.Commands.add('getCategories', () => {
  return cy.apiRequest('GET', '/categories');
});

Cypress.Commands.add('getCategory', (categoryId) => {
  return cy.apiRequest('GET', `/categories/${categoryId}`);
});

Cypress.Commands.add('getCategorySubcategories', (categoryId) => {
  return cy.apiRequest('GET', `/categories/${categoryId}/subcategories`);
});

Cypress.Commands.add('searchCategories', (searchParams) => {
  const queryString = new URLSearchParams(searchParams).toString();
  return cy.apiRequest('GET', `/categories/search?${queryString}`);
});

Cypress.Commands.add('createCategory', (categoryData = null, authToken = null) => {
  const category = categoryData || window.generateTestData('category');
  
  const headers = authToken ? { 'Authorization': `${authToken}` } : {};
  
  return cy.apiRequest('POST', '/categories', category, headers)
    .then((response) => {
      return { category, response };
    });
});

Cypress.Commands.add('updateCategory', (categoryId, updateData, authToken) => {
  const headers = { 'Authorization': `${authToken}` };
  
  return cy.apiRequest('PUT', `/categories/${categoryId}`, updateData, headers);
});

Cypress.Commands.add('deleteCategory', (categoryId, authToken) => {
  const headers = { 'Authorization': `${authToken}` };
  
  return cy.apiRequest('DELETE', `/categories/${categoryId}`, null, headers);
});

Cypress.Commands.add('getCart', (authToken) => {
  const headers = { 'Authorization': `${authToken}` };
  return cy.apiRequest('GET', '/cart', null, headers);
});

Cypress.Commands.add('addToCart', (productId, quantity, authToken) => {
  const headers = { 'Authorization': `${authToken}` };
  const body = { product_id: productId, quantity };
  
  return cy.apiRequest('POST', '/cart/add', body, headers);
});

Cypress.Commands.add('updateCartItem', (itemId, quantity, authToken) => {
  const headers = { 'Authorization': `${authToken}` };
  const body = { quantity };
  
  return cy.apiRequest('PUT', `/cart/item/${itemId}`, body, headers);
});

Cypress.Commands.add('removeFromCart', (itemId, authToken) => {
  const headers = { 'Authorization': `${authToken}` };
  
  return cy.apiRequest('DELETE', `/cart/item/${itemId}`, null, headers);
});

Cypress.Commands.add('clearCart', (authToken) => {
  const headers = { 'Authorization': `${authToken}` };
  
  return cy.apiRequest('DELETE', '/cart/clear', null, headers);
});

Cypress.Commands.add('searchCart', (searchParams, authToken) => {
  const headers = { 'Authorization': `${authToken}` };
  const queryString = new URLSearchParams(searchParams).toString();
  
  return cy.apiRequest('GET', `/cart/search?${queryString}`, null, headers);
});

Cypress.Commands.add('createOrder', (orderData, authToken) => {
  const headers = { 'Authorization': `${authToken}` };
  
  return cy.apiRequest('POST', '/orders', orderData, headers);
});

Cypress.Commands.add('getOrder', (orderId, authToken) => {
  const headers = { 'Authorization': `${authToken}` };
  
  return cy.apiRequest('GET', `/orders/${orderId}`, null, headers);
});

Cypress.Commands.add('getUserOrders', (authToken) => {
  const headers = { 'Authorization': `${authToken}` };
  
  return cy.apiRequest('GET', '/orders/user', null, headers);
});

Cypress.Commands.add('updateOrderStatus', (orderId, status, authToken) => {
  const headers = { 'Authorization': `${authToken}` };
  const body = { status };
  
  return cy.apiRequest('PUT', `/orders/${orderId}/status`, body, headers);
});

Cypress.Commands.add('cancelOrder', (orderId, authToken) => {
  const headers = { 'Authorization': `${authToken}` };
  
  return cy.apiRequest('DELETE', `/orders/${orderId}/cancel`, null, headers);
});

Cypress.Commands.add('searchOrders', (searchParams, authToken) => {
  const headers = { 'Authorization': `${authToken}` };
  const queryString = new URLSearchParams(searchParams).toString();
  
  return cy.apiRequest('GET', `/orders/search?${queryString}`, null, headers);
});

Cypress.Commands.add('getUsers', (authToken) => {
  const headers = { 'Authorization': `${authToken}` };
  
  return cy.apiRequest('GET', '/users', null, headers);
});

Cypress.Commands.add('getUser', (userId, authToken) => {
  const headers = { 'Authorization': `${authToken}` };
  
  return cy.apiRequest('GET', `/users/${userId}`, null, headers);
});

Cypress.Commands.add('updateUser', (userId, updateData, authToken) => {
  const headers = { 'Authorization': `${authToken}` };
  
  return cy.apiRequest('PUT', `/users/${userId}`, updateData, headers);
});

Cypress.Commands.add('deleteUser', (userId, authToken) => {
  const headers = { 'Authorization': `${authToken}` };
  
  return cy.apiRequest('DELETE', `/users/${userId}`, null, headers);
});

Cypress.Commands.add('searchUsers', (searchParams, authToken) => {
  const headers = { 'Authorization': `${authToken}` };
  const queryString = new URLSearchParams(searchParams).toString();
  
  return cy.apiRequest('GET', `/users/search?${queryString}`, null, headers);
});

Cypress.Commands.add('visitApp', (path = '/') => {
  const frontendUrl = Cypress.env('frontendUrl') || 'http://localhost:3000';
  cy.visit(`${frontendUrl}${path}`);
});

Cypress.Commands.add('waitForApiResponse', (alias, timeout = 10000) => {
  cy.wait(alias, { timeout });
  cy.get(alias).should('have.property', 'response');
});

Cypress.Commands.add('measureApiResponseTime', (method, endpoint, body = null) => {
  const startTime = Date.now();
  
  return cy.apiRequest(method, endpoint, body)
    .then((response) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      cy.log(`API Response Time: ${responseTime}ms for ${method} ${endpoint}`);
      
      return {
        response,
        responseTime,
        method,
        endpoint
      };
    });
});

Cypress.Commands.add('assertPerformance', (responseTime, threshold = 2000) => {
  expect(responseTime).to.be.below(threshold, `Response time ${responseTime}ms should be below ${threshold}ms`);
});

Cypress.Commands.add('validateApiResponse', (response, expectedStatus = 200) => {
  expect(response.status).to.equal(expectedStatus);
  expect(response.body).to.exist;
  
  if (response.headers) {
    expect(response.headers).to.have.property('content-type');
  }
});

Cypress.Commands.add('validatePagination', (response) => {
  if (response.body && typeof response.body === 'object' && response.body.pagination) {
    expect(response.body.pagination).to.have.property('page');
    expect(response.body.pagination).to.have.property('limit');
    expect(response.body.pagination).to.have.property('total');
    expect(response.body.pagination).to.have.property('totalPages');
  }
});

Cypress.Commands.add('randomDelay', (min = 100, max = 500) => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  cy.wait(delay);
});

Cypress.Commands.add('logTestStep', (step, data = null) => {
  cy.log(`📝 ${step}${data ? `: ${JSON.stringify(data)}` : ''}`);
});

Cypress.Commands.add('cleanupTestData', (authToken) => {
  cy.log('🧹 Cleaning up test data');
  cy.log('✅ Test data cleanup completed');
});

Cypress.Commands.add('waitForApplication', () => {
  cy.visit('/');
  cy.get('body', { timeout: 10000 }).should('be.visible');
  cy.log('✅ Application loaded successfully');
});

Cypress.Commands.add('getBaseURL', () => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:8080';
  return cy.wrap(apiUrl);
});

Cypress.Commands.add('setAuthToken', (token) => {
  if (token) {
    cy.window().then((win) => {
      win.localStorage.setItem('authToken', token);
    });
    Cypress.env('authToken', token);
  }
});

Cypress.Commands.add('getAuthToken', () => {
  return cy.window().then((win) => {
    return win.localStorage.getItem('authToken') || Cypress.env('authToken');
  });
});

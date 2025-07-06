import './commands';

import '@cypress/grep/src/support';

Cypress.on('uncaught:exception', (err, runnable) => {
  console.log('Uncaught exception:', err.message);
  return false;
});

beforeEach(() => {
  cy.clearAllSessionStorage();
  
  cy.clearAllCookies();
  
  cy.clearAllLocalStorage();
  
  cy.log(`Starting test: ${Cypress.currentTest.title}`);
});

afterEach(() => {
  cy.log(`Completed test: ${Cypress.currentTest.title}`);
  
  if (Cypress.currentTest.state === 'failed') {
    cy.screenshot(`failed-${Cypress.currentTest.title}`, { capture: 'fullPage' });
  }
});

chai.use((chai, utils) => {
  chai.Assertion.addMethod('validApiResponse', function (expectedStatus = 200) {
    const obj = this._obj;
    
    new chai.Assertion(obj).to.exist;
    
    new chai.Assertion(obj.status).to.equal(expectedStatus);
    
    new chai.Assertion(obj.headers).to.exist;
    new chai.Assertion(obj.headers['content-type']).to.include('application/json');
    
    new chai.Assertion(obj.body).to.exist;
  });
  
  chai.Assertion.addMethod('validJwtToken', function () {
    const token = this._obj;
    
    new chai.Assertion(token).to.be.a('string');
    new chai.Assertion(token.length).to.be.greaterThan(0);
    
    const parts = token.split('.');
    new chai.Assertion(parts).to.have.length(3);
    
    parts.forEach(part => {
      new chai.Assertion(part).to.match(/^[A-Za-z0-9_-]+$/);
    });
  });
  
  chai.Assertion.addMethod('validProductObject', function () {
    const product = this._obj;
    
    new chai.Assertion(product).to.have.property('id').that.is.a('number');
    new chai.Assertion(product).to.have.property('name').that.is.a('string');
    new chai.Assertion(product).to.have.property('description').that.is.a('string');
    new chai.Assertion(product).to.have.property('price').that.is.a('number');
    new chai.Assertion(product).to.have.property('category_id').that.is.a('number');
    new chai.Assertion(product).to.have.property('stock').that.is.a('number');
    
    new chai.Assertion(product.price).to.be.at.least(0);
    new chai.Assertion(product.stock).to.be.at.least(0);
    new chai.Assertion(product.name.length).to.be.at.least(1);
  });
  
  chai.Assertion.addMethod('validCategoryObject', function () {
    const category = this._obj;
    
    new chai.Assertion(category).to.have.property('id').that.is.a('number');
    new chai.Assertion(category).to.have.property('name').that.is.a('string');
    new chai.Assertion(category).to.have.property('icon_url').that.is.a('string');
    new chai.Assertion(category).to.have.property('created_at').that.is.a('string');
    new chai.Assertion(category).to.have.property('updated_at').that.is.a('string');
    
    new chai.Assertion(category.name.length).to.be.at.least(1);
  });
  
  chai.Assertion.addMethod('validCartItem', function () {
    const item = this._obj;
    
    new chai.Assertion(item).to.have.property('id').that.is.a('number');
    new chai.Assertion(item).to.have.property('product_id').that.is.a('number');
    new chai.Assertion(item).to.have.property('quantity').that.is.a('number');
    new chai.Assertion(item.quantity).to.be.at.least(1);
  });
});

Cypress.Commands.add('logApiCall', (method, url, body = null) => {
  if (Cypress.env('enableApiLogging')) {
    try {
      const bodyStr = body ? ` with body: ${JSON.stringify(body)}` : '';
      cy.log(`API ${method.toUpperCase()}: ${url}${bodyStr}`);
    } catch (e) {
      cy.log(`API ${method.toUpperCase()}: ${url} with body: [Complex Object]`);
    }
  }
});

Cypress.Commands.add('waitForApiResponse', (alias, timeout = 10000) => {
  cy.wait(alias, { timeout });
  cy.get(alias).should('have.property', 'response');
  cy.get(alias).its('response.statusCode').should('be.oneOf', [200, 201, 204]);
});

function generateTestData(type) {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  
  switch (type) {
    case 'user':
      return {
        name: `TestUser${random}`,
        surname: `TestSurname${random}`,
        email: `test${timestamp}${random}@example.com`,
        password: `testpass${random}`
      };
    case 'product':
      return {
        name: `Test Product ${random}`,
        description: `Test product description ${timestamp}`,
        price: Math.floor(Math.random() * 1000) + 10,
        category_id: 1,
        stock: Math.floor(Math.random() * 100) + 1
      };
    case 'category':
      return {
        name: `Test Category ${random}`,
        description: `Test category description ${timestamp}`
      };
    default:
      throw new Error(`Unknown test data type: ${type}`);
  }
}

window.generateTestData = generateTestData;

Cypress.Commands.add('generateTestData', (type) => {
  return generateTestData(type);
});

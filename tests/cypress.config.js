const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    apiUrl: 'http://localhost:8080',
    
    viewportWidth: 1280,
    viewportHeight: 720,
    
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    
    watchForFileChanges: false,
    chromeWebSecurity: false,
    
    retries: {
      runMode: 2,
      openMode: 0
    },
    
    video: true,
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    videoCompression: 32,
    
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    fixturesFolder: 'cypress/fixtures',
    
    setupNodeEvents(on, config) {
      require('@cypress/grep/src/plugin')(config);
      
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        
        async checkApiHealth() {
          try {
            const axios = require('axios');
            const response = await axios.get(`${config.env.apiUrl || 'http://localhost:8080'}/health`);
            return { status: response.status, data: response.data };
          } catch (error) {
            return { error: error.message };
          }
        },
        
        async checkFrontendHealth() {
          try {
            const axios = require('axios');
            const response = await axios.get(config.baseUrl || 'http://localhost:3000');
            return { status: response.status };
          } catch (error) {
            return { error: error.message };
          }
        }
      });
      
      return config;
    },
    
    env: {
      apiUrl: 'http://localhost:8080',
      frontendUrl: 'http://localhost:3000',
      
      testUser: {
        email: 'test@example.com',
        password: 'testpassword123',
        name: 'Test',
        surname: 'User'
      },
      
      adminUser: {
        email: 'admin@example.com',
        password: 'adminpassword123',
        name: 'Admin',
        surname: 'User'
      },
      
      testTimeout: 10000,
      apiTimeout: 5000,
      
      enableVideoRecording: true,
      enableScreenshots: true,
      enableApiLogging: true
    }
  },
  
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite'
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.js'
  }
});

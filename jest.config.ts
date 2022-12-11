/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
  clearMocks: true,
  coverageProvider: 'v8',
  preset: 'ts-jest',

  globalSetup: './tests/setup.js',
  globalTeardown: './tests/teardown.js',
  testEnvironment: './tests/puppeteer_environment.js'
};

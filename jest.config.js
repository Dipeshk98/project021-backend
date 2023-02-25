module.exports = {
  testMatch: ['**/*.test.{js,ts}'],
  transform: {
    '^.+\\.[jt]s$': ['@swc/jest'],
  },
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured for you soon)
    '^@/(.*)$': '<rootDir>/src/$1',

    '^__mocks__/(.*)$': '<rootDir>/__mocks__/$1',
  },
  globalSetup: '<rootDir>/jest.global-setup.ts',
  setupFiles: ['<rootDir>/jest.setup.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup-after-env.ts'],
  globalTeardown: '<rootDir>/jest.global-teardown.ts',
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!(execa|nanoid))/'],
  testTimeout: 30000,
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: [
    './src/**/*.{js,ts}',
    './tests/**/*.{js,ts}',
    '!src/handler.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.serverless/'],
};

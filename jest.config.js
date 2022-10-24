module.exports = {
  preset: '@shelf/jest-mongodb',
  testMatch: ['**/*.test.{js,ts}'],
  transform: {
    '^.+\\.ts$': ['@swc/jest'],
  },
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured for you soon)
    '^@/(.*)$': '<rootDir>/src/$1',

    '^__mocks__/(.*)$': '<rootDir>/__mocks__/$1',
  },
  setupFiles: ['<rootDir>/jest.env-setup.js'],
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
  watchPathIgnorePatterns: ['<rootDir>/globalConfig.json'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.serverless/'],
};

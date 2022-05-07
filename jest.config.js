module.exports = {
  preset: 'jest-dynalite',
  testMatch: ['**/*.test.{js,ts}'],
  transform: {
    '^.+\\.ts$': ['ts-jest'],
  },
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured for you soon)
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFiles: ['<rootDir>/jest.env-setup.js'],
  collectCoverage: true,
  collectCoverageFrom: [
    './src/**/*.{js,ts}',
    './test/**/*.{js,ts}',
    '!src/handler.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.serverless/'],
};

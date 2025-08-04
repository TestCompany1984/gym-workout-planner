import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    timeout: 30000, // 30 seconds for database operations
    pool: 'forks', // Use forks for better isolation
    testTimeout: 10000, // 10 seconds per test
    hookTimeout: 30000, // 30 seconds for setup/teardown
  },
});
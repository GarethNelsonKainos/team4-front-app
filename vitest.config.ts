import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: 'output/test',
      thresholds: {
        global: {
          statements: 80,
          branches: 75,
          functions: 100,
          lines: 80
        }
      }
    },
  },
});
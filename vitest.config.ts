import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['tests/**', 'node_modules'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: 'output/test',
      // thresholds: {
      //   global: {
      //     statements: 80,
      //     branches: 80,
      //     functions: 100,
      //     lines: 80
      //   }
      // }
    },
  },
});
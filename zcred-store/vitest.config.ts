// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    isolate: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
    },
    pool: 'forks',
  },
});

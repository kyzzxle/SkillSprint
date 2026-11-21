import { defineConfig } from 'vitest/config';

// JSX settings (Preact) are read from tsconfig.json.
export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});

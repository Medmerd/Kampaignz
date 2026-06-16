import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['apps/xml-parse/Tests/**/*.test.ts'],
  },
});

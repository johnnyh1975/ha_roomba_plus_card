import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include:     ['tests/**/*.test.ts'],
    coverage: {
      provider:  'v8',
      reporter:  ['text', 'lcov'],
      include:   ['src/**/*.ts'],
      exclude:   ['src/roomba-plus-card.ts'], // root card requires DOM; covered indirectly
    },
  },
  resolve: {
    // allow .js imports to resolve .ts files in TypeScript source
    extensions: ['.ts', '.js'],
  },
});

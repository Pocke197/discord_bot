import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
  globals: true,
  root: './',
  include: ['**/*.spec.ts'],
  coverage: {
    provider: 'v8',
    include: ['src/**/*.ts'],
    exclude: [
      'src/generated/**',
      'src/main.ts',
      '**/*.module.ts',
      '**/*.dto.ts',
      '**/*.spec.ts',
    ],
    thresholds: {
      lines: 48,
      statements: 48,
      functions: 55,
      branches: 33,
},
  },
},
});

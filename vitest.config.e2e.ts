import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    env: {
      DISCORD_BOT_TOKEN: 'test-token',
      DATABASE_URL: 'postgres://usuario:clave@localhost:5432/test',
      STEAM_API_KEY: 'test-key',
      PUBLIC_URL: 'https://example.com',
    },
  },
});

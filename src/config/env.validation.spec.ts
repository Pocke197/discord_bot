import { validateEnv } from './env.validation.js';

describe('validateEnv', () => {
  const validEnvironment = {
    DISCORD_BOT_TOKEN: 'discord-token',
    DATABASE_URL: 'postgres://localhost:5432/database',
    STEAM_API_KEY: 'steam-api-key',
    PUBLIC_URL: 'https://example.com',
  };

  it('accepts a complete environment configuration', () => {
    expect(validateEnv(validEnvironment)).toEqual(
      expect.objectContaining(validEnvironment),
    );
  });

  it.each([
    'DISCORD_BOT_TOKEN',
    'DATABASE_URL',
    'STEAM_API_KEY',
    'PUBLIC_URL',
  ] as const)('rejects an environment without %s', (name) => {
    const { [name]: _omitted, ...environmentWithoutVariable } =
      validEnvironment;

    expect(() => validateEnv(environmentWithoutVariable)).toThrow(name);
  });

  it('rejects an empty required value', () => {
    expect(() =>
      validateEnv({
        ...validEnvironment,
        DISCORD_BOT_TOKEN: '   ',
      }),
    ).toThrow('DISCORD_BOT_TOKEN');
  });

  it('rejects a PUBLIC_URL without a protocol', () => {
    expect(() =>
      validateEnv({
        ...validEnvironment,
        PUBLIC_URL: 'example.com',
      }),
    ).toThrow('PUBLIC_URL');
  });

  it('accepts a localhost PUBLIC_URL with http', () => {
    expect(
      validateEnv({
        ...validEnvironment,
        PUBLIC_URL: 'http://localhost:3000',
      }),
    ).toEqual(expect.objectContaining({ PUBLIC_URL: 'http://localhost:3000' }));
  });
});

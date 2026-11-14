const REQUIRED = [
  'DISCORD_BOT_TOKEN',
  'DATABASE_URL',
  'STEAM_API_KEY',
  'PUBLIC_URL',
] as const;

export const validateEnv = (config: Record<string, unknown>): Env => {
  const errors: string[] = [];

  for (const name of REQUIRED) {
    const value = config[name];
    if (typeof value !== 'string' || value.trim() === '') {
      errors.push(`${name} is missing`);
    }
  }

  const publicUrl = config.PUBLIC_URL;
  if (typeof publicUrl === 'string' && !/^https?:\/\//.test(publicUrl)) {
    errors.push('PUBLIC_URL must start with http:// or https://');
  }

  if (errors.length > 0) {
    throw new Error(`Invalid environment variables: ${errors.join(', ')}`);
  }

  return config as Env;
};

export type Env = Record<(typeof REQUIRED)[number], string>;

const STEAM_LINK_TTL_MS = 10 * 60 * 1000;
const LIMIT_TOP_GAMES = 15;
const LIMIT_COMMON_GAMES = 15;
const LIMIT_CHARACTERS = 2000;
const POINTS_PER_LEVEL = 3;

const SAFE_MESSAGES = new Set([
  'Invalid or expired token',
  'Token has expired',
  'Steam account is already linked to another user',
  'This user already has a linked Steam account',
]);

const STATS_ERROR = new Set([
  'Not enough available points to assign',
  'Invalid amount',
]);

export default {
  STEAM_LINK_TTL_MS,
  SAFE_MESSAGES,
  STATS_ERROR,
  LIMIT_TOP_GAMES,
  LIMIT_COMMON_GAMES,
  LIMIT_CHARACTERS,
  POINTS_PER_LEVEL,
};

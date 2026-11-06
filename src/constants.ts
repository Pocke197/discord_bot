const STEAM_LINK_TTL_MS = 10 * 60 * 1000;
const SAFE_MESSAGES = new Set([
  'Invalid or expired token',
  'Token has expired',
  'Steam account is already linked to another user',
]);

export default {
  STEAM_LINK_TTL_MS,
  SAFE_MESSAGES,
};

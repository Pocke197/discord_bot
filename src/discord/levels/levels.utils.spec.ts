import { xpForLevel, levelForXp } from './levels.utils.js';

describe('LevelUtils', () => {
  it.each([
    [1, 155],
    [2, 220],
    [3, 295],
  ])('calculates XP for level %d', (level, expectedXp) => {
    expect(xpForLevel(level)).toBe(expectedXp);
  });

  it.each([
    [155, 1],
    [365, 2],
    [640, 3],
  ])('calculates level for %d XP', (xp, expectedLevel) => {
    expect(levelForXp(xp)).toBe(expectedLevel);
  });
});

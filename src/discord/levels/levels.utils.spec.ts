import constants from '../../constants.js';
import {
  getAura,
  getAvailablePoints,
  getSpentPoints,
  levelForXp,
  type Stats,
  xpForLevel,
} from './levels.utils.js';

describe('LevelUtils', () => {
  describe('xpForLevel', () => {
    it.each([
      [1, 155],
      [2, 220],
      [3, 295],
    ])('calculates XP for level %d', (level, expectedXp) => {
      expect(xpForLevel(level)).toBe(expectedXp);
    });
  });

  describe('levelForXp', () => {
    it.each([
      [155, 1],
      [365, 2],
      [640, 3],
    ])('calculates level for %d XP', (xp, expectedLevel) => {
      expect(levelForXp(xp)).toBe(expectedLevel);
    });
  });

  describe('getAura', () => {
    it.each<[Stats, number]>([
      [{ luck: 0, charisma: 0, endurance: 0, skill: 0 }, 0],
      [{ luck: 0, charisma: 3, endurance: 0, skill: 0 }, 6],
      [{ luck: 2, charisma: 0, endurance: 0, skill: 0 }, 3],
      [{ luck: 0, charisma: 0, endurance: 5, skill: 0 }, 6],
      [{ luck: 0, charisma: 0, endurance: 0, skill: 3 }, 3],
      [{ luck: 1, charisma: 0, endurance: 0, skill: 0 }, 2],
      [{ luck: 0, charisma: 0, endurance: 1, skill: 0 }, 1],
      [{ luck: 2, charisma: 1, endurance: 4, skill: 3 }, 13],
    ])('calculates aura for %j', (stats, expectedAura) => {
      expect(getAura(stats)).toBe(expectedAura);
    });
  });

  describe('getSpentPoints', () => {
    it.each<[Stats, number]>([
      [{ luck: 0, charisma: 0, endurance: 0, skill: 0 }, 0],
      [{ luck: 2, charisma: 3, endurance: 4, skill: 1 }, 10],
    ])('calculates spent points for %j', (stats, expectedPoints) => {
      expect(getSpentPoints(stats)).toBe(expectedPoints);
    });
  });

  describe('getAvailablePoints', () => {
    it.each([
      [0, 0, 0],
      [5, 0, constants.POINTS_PER_LEVEL * 5],
      [5, 10, constants.POINTS_PER_LEVEL * 5 - 10],
      [1, 10, 0],
    ])(
      'calculates available points for level %d',
      (level, spentPoints, expectedPoints) => {
        expect(
          getAvailablePoints(level, {
            luck: spentPoints,
            charisma: 0,
            endurance: 0,
            skill: 0,
          }),
        ).toBe(expectedPoints);
      },
    );
  });
});

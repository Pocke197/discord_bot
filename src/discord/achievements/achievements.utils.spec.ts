import { getNewAchievements } from './achievements.utils.js';
import type { AchievementDefinition } from './achievements.definitions.js';

const achievements: AchievementDefinition[] = [
  {
    id: 'level-5',
    name: 'Level 5',
    description: 'Reach level 5',
    emoji: '⭐',
    scope: 'global',
    metric: 'level',
    threshold: 5,
  },
  {
    id: 'level-10',
    name: 'Level 10',
    description: 'Reach level 10',
    emoji: '🏆',
    scope: 'global',
    metric: 'level',
    threshold: 10,
  },
  {
    id: 'hours-100',
    name: '100 hours',
    description: 'Play a single game for 100 hours',
    emoji: '🎮',
    scope: 'global',
    metric: 'hours-single-game',
    threshold: 100,
  },
];

const ids = (list: AchievementDefinition[]) => list.map(({ id }) => id);

describe('getNewAchievements', () => {
  it('returns no achievements for level 3', () => {
    expect(
      ids(getNewAchievements(achievements, 'level', 3, new Set())),
    ).toEqual([]);
  });

  it('returns level-5 for level 5', () => {
    expect(
      ids(getNewAchievements(achievements, 'level', 5, new Set())),
    ).toEqual(['level-5']);
  });

  it('returns both level achievements for level 12', () => {
    expect(
      ids(getNewAchievements(achievements, 'level', 12, new Set())),
    ).toEqual(['level-5', 'level-10']);
  });

  it('does not return achievements already earned', () => {
    expect(
      ids(getNewAchievements(achievements, 'level', 12, new Set(['level-5']))),
    ).toEqual(['level-10']);
  });

  it('returns no achievements when both level achievements are earned', () => {
    expect(
      ids(
        getNewAchievements(
          achievements,
          'level',
          12,
          new Set(['level-5', 'level-10']),
        ),
      ),
    ).toEqual([]);
  });

  it('returns only achievements for the requested metric', () => {
    expect(
      ids(
        getNewAchievements(achievements, 'hours-single-game', 150, new Set()),
      ),
    ).toEqual(['hours-100']);
  });
});

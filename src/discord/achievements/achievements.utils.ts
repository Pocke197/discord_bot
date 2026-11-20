import type { AchievementDefinition } from './achievements.definitions.js';

const getNewAchievements = (
  definitions: readonly AchievementDefinition[],
  metric: AchievementDefinition['metric'],
  value: AchievementDefinition['threshold'],
  unlockedIds: Set<string>,
): AchievementDefinition[] => {
  return definitions.filter((achievement) => {
    return (
      !unlockedIds.has(achievement.id) &&
      achievement.metric === metric &&
      value >= achievement.threshold
    );
  });
};

export { getNewAchievements };

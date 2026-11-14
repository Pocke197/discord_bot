import constants from '../../constants.js';

export type Stats = {
  luck: number;
  charisma: number;
  endurance: number;
  skill: number;
};

const getSpentPoints = (stats: Stats): number => {
  return stats.luck + stats.charisma + stats.endurance + stats.skill;
};

const getAvailablePoints = (level: number, stats: Stats): number => {
  const spentPoints = getSpentPoints(stats);
  const availablePoints = Math.max(
    0,
    level * constants.POINTS_PER_LEVEL - spentPoints,
  );
  return availablePoints;
};

const getAura = (stats: Stats): number => {
  const { luck, charisma, endurance, skill } = stats;
  const aura = Math.round(charisma * 2 + luck * 1.5 + endurance * 1.2 + skill);
  return aura;
};

export { getAura, getAvailablePoints, getSpentPoints };

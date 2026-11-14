import constants from '../../constants.js';

const xpForLevel = (level: number): number => {
  return Math.floor(5 * level ** 2 + 50 * level + 100);
};

const getLevelProgress = (xp: number) => {
  let level = 0;
  let currentXp = xp;

  while (currentXp >= xpForLevel(level)) {
    currentXp -= xpForLevel(level);
    level++;
  }

  return { level, currentXp, neededXp: xpForLevel(level) };
};

const levelForXp = (xp: number): number => getLevelProgress(xp).level;

const getRandomXp = (): number => {
  return (
    Math.floor(Math.random() * (constants.MAX_XP - constants.MIN_XP + 1)) +
    constants.MIN_XP
  );
};

export { xpForLevel, levelForXp, getRandomXp, getLevelProgress };

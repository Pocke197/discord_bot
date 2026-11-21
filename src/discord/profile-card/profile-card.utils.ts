export const getXpRatio = (currentXp: number, neededXp: number): number => {
  if (neededXp === 0) return 0;

  return Math.min(1, Math.max(0, currentXp / neededXp));
};

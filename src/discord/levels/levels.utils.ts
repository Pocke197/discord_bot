const xpForLevel = (level: number): number => {
  return Math.floor(5 * (level ** 2) + 50 * level + 100);
}

const levelForXp = (xp: number): number => {
    let level = 0;
    while (xp >= xpForLevel(level)) {
        xp -= xpForLevel(level);
        level++;
    }
    return level;
}

export { xpForLevel, levelForXp };
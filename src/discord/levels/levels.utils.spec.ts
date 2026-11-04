import { xpForLevel, levelForXp } from './levels.utils.js';

describe('LevelUtils', () => {
  it('should calculate XP for a given level', () => {
    expect(xpForLevel(1)).toBe(155);
    expect(xpForLevel(2)).toBe(220);
    expect(xpForLevel(3)).toBe(295);
  });

  it('should calculate level for a given XP', () => {
    expect(levelForXp(155)).toBe(1);
    expect(levelForXp(365)).toBe(2);
    expect(levelForXp(640)).toBe(3);
  });
});

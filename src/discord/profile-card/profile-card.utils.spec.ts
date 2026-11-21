import { getXpRatio } from './profile-card.utils.js';

describe('getXpRatio', () => {
  it('returns 0.5 when XP is halfway to the needed XP', () => {
    expect(getXpRatio(300, 600)).toBe(0.5);
  });

  it('returns 0 when neededXp is 0', () => {
    expect(getXpRatio(100, 0)).toBe(0);
  });

  it('returns 1 when XP exceeds the needed XP', () => {
    expect(getXpRatio(800, 600)).toBe(1);
  });

  it('returns 0 when XP is negative', () => {
    expect(getXpRatio(-100, 600)).toBe(0);
  });
});

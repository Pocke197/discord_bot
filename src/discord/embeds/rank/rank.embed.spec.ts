import type { RankEntry } from '../../rank/rank.utils.js';
import { buildWeeklyRankingEmbed } from './rank.embed.js';

const descriptionOf = (ranking: RankEntry[]) =>
  buildWeeklyRankingEmbed(ranking).data.description ?? '';

describe('buildWeeklyRankingEmbed', () => {
  it('uses medals for the first three entries', () => {
    const description = descriptionOf([
      { userId: 'user-1', hours: 3 },
      { userId: 'user-2', hours: 2 },
      { userId: 'user-3', hours: 1 },
    ]);
    const lines = description.split('\n');

    expect(lines[0]).toMatch(/^🥇/);
    expect(lines[1]).toMatch(/^🥈/);
    expect(lines[2]).toMatch(/^🥉/);
  });

  it('numbers entries from fourth place onward', () => {
    const description = descriptionOf([
      { userId: 'user-1', hours: 4 },
      { userId: 'user-2', hours: 3 },
      { userId: 'user-3', hours: 2 },
      { userId: 'user-4', hours: 1 },
    ]);

    expect(description.split('\n')[3]).toMatch(/^4\./);
  });

  it('limits the ranking to ten entries', () => {
    const entries = Array.from({ length: 12 }, (_, i) => ({
      userId: `user-${i}`,
      hours: 12 - i,
    }));

    expect(descriptionOf(entries).split('\n')).toHaveLength(10);
  });

  it('shows a message when there are no entries', () => {
    expect(descriptionOf([])).toBe('No one played this week');
  });

  it('includes the user mention and formatted hours', () => {
    const description = descriptionOf([{ userId: '123', hours: 2 }]);

    expect(description).toContain('<@123>');
    expect(description).toContain('2.0 h');
  });
});

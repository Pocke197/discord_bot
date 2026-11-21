import { EmbedBuilder } from 'discord.js';
import type { RankEntry } from '../../rank/rank.utils.js';

const MEDALS = ['🥇', '🥈', '🥉'];
const MAX_RANKING_ENTRIES = 10;

export const buildWeeklyRankingEmbed = (ranking: RankEntry[]): EmbedBuilder => {
  const description = ranking.length
    ? ranking
        .slice(0, MAX_RANKING_ENTRIES)
        .map((entry, index) => {
          const position = MEDALS[index] ?? `${index + 1}.`;

          return `${position} <@${entry.userId}> — ${entry.hours.toFixed(1)} h`;
        })
        .join('\n')
    : 'No one played this week';

  return new EmbedBuilder()
    .setTitle('🏆 Weekly ranking')
    .setDescription(description)
    .setColor('Gold')
    .setFooter({ text: 'Last 7 days' });
};

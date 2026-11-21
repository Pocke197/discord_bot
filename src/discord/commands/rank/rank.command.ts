import { Injectable, Logger } from '@nestjs/common';
import { Context, SlashCommand } from 'necord';
import type { SlashCommandContext } from 'necord';
import { MessageFlags } from 'discord.js';
import { RankService } from '../../rank/rank.service.js';
import { buildWeeklyRankingEmbed } from '../../embeds/rank/rank.embed.js';

@Injectable()
export class RankCommands {
  private readonly logger = new Logger(RankCommands.name);

  constructor(private readonly rankService: RankService) {}

  @SlashCommand({
    name: 'rank-games',
    description: 'View the weekly gaming ranking of the server',
  })
  public async rank(@Context() [interaction]: SlashCommandContext) {
    if (interaction.guildId === null) {
      return await interaction.reply({
        content: 'This command can only be used in a server.',
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      const ranking = await this.rankService.getWeeklyRanking(
        interaction.guildId,
      );

      const embed = buildWeeklyRankingEmbed(ranking);

      return await interaction.reply({ embeds: [embed] });
    } catch (error) {
      const errorName = error instanceof Error ? error.name : 'UnknownError';
      this.logger.error(`Error fetching the weekly ranking: ${errorName}`);

      return await interaction.reply({
        content: 'Unable to fetch the weekly ranking. Please try again later.',
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { Context, Options, SlashCommand } from 'necord';
import type { SlashCommandContext } from 'necord';
import { StatsService } from '../../stats/stats.service.js';
import { StatsDto } from './stats.dto.js';
import { MessageFlags } from 'discord.js';
import constants from '../../../constants.js';

@Injectable()
export class StatsCommand {
  private readonly logger = new Logger(StatsCommand.name);
  constructor(private readonly statsService: StatsService) {}
  @SlashCommand({
    name: 'stats',
    description: 'Assign points to your stats',
  })
  public async stats(
    @Context() [interaction]: SlashCommandContext,
    @Options() options: StatsDto,
  ) {
    if (interaction.guildId === null) {
      return await interaction.reply({
        content: 'This command can only be used in a server.',
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      const remainingPoints = await this.statsService.assignPoints(
        interaction.user.id,
        interaction.guildId,
        options.stat,
        options.amount,
      );

      return await interaction.reply({
        content: `Successfully assigned ${options.amount} points to ${options.stat}. You have ${remainingPoints} points remaining.`,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        constants.STATS_ERROR.has(error.message)
      ) {
        return await interaction.reply({
          content: error.message,
          flags: MessageFlags.Ephemeral,
        });
      }

      const errorName = error instanceof Error ? error.name : 'UnknownError';
      this.logger.error(`Error in StatsCommand: ${errorName}`);
      return await interaction.reply({
        content: 'Something went wrong.',
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}

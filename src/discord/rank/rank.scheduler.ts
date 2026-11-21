import { RankService } from './rank.service.js';
import { Client } from 'discord.js';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { Injectable, Logger } from '@nestjs/common';
import { buildWeeklyRankingEmbed } from '../embeds/rank/rank.embed.js';

@Injectable()
export class RankScheduler {
  private readonly logger = new Logger(RankScheduler.name);

  constructor(
    private readonly rankService: RankService,
    private readonly client: Client,
    private readonly configService: ConfigService,
  ) {}

  @Cron('0 12 * * 1', { timeZone: 'America/Argentina/Buenos_Aires' })
  async sendWeeklySummary() {
    const channelId = this.configService.get<string>(
      'DISCORD_WEEKLY_RANKING_CHANNEL_ID',
    );

    if (!channelId) {
      this.logger.log(
        'DISCORD_WEEKLY_RANKING_CHANNEL_ID is not set in the environment variables.',
      );
      return;
    }

    try {
      const channel = await this.client.channels.fetch(channelId);
      if (!channel?.isSendable() || channel.isDMBased()) {
        this.logger.error('The weekly ranking channel is not sendable.');
        return;
      }

      const calculatedRanking = await this.rankService.getWeeklyRanking(
        channel.guildId,
      );
      const embed = buildWeeklyRankingEmbed(calculatedRanking);

      await channel.send({ embeds: [embed] });
    } catch (error) {
      const errorName = error instanceof Error ? error.name : 'UnknownError';
      this.logger.error(`Failed to send weekly ranking: ${errorName}`);
    }
  }
}

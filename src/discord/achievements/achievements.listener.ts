import { Injectable, Logger } from '@nestjs/common';
import { AchievementsService } from './achievements.service.js';
import { Client } from 'discord.js';
import { LEVEL_UP_EVENT, type LevelUpEvent } from './achievements.events.js';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class AchievementsListener {
  constructor(
    private readonly achievementsService: AchievementsService,
    private readonly discordClient: Client,
  ) {}

  private readonly logger = new Logger(AchievementsListener.name);

  @OnEvent(LEVEL_UP_EVENT)
  async handleLevelUpEvent(event: LevelUpEvent) {
    try {
      const newAchievements =
        await this.achievementsService.checkLevelAchievements(
          event.userId,
          event.guildId,
          event.level,
        );
      if (newAchievements.length === 0) return;

      const channel = await this.discordClient.channels.fetch(event.channelId);
      if (!channel?.isSendable()) return;

      const alert = newAchievements
        .map(
          (a) =>
            `<@${event.userId}> 🎉 Congratulations! You've unlocked the achievement: **${a.name}** - ${a.description}`,
        )
        .join('\n');
      await channel.send(alert);
    } catch (error) {
      const errorName = error instanceof Error ? error.name : 'UnknownError';
      this.logger.error(
        `Error occurred while handling level up event: ${errorName}`,
      );
    }
  }
}

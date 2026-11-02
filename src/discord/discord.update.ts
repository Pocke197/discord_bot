import { Injectable, Logger } from '@nestjs/common';
import { On, Once, Context } from 'necord';
import type { ContextOf } from 'necord';
import { LevelsService } from './levels/levels.service.js';

@Injectable()
export class DiscordUpdate {
  private readonly logger = new Logger(DiscordUpdate.name);

  constructor(private readonly levelsService: LevelsService) {}

  @Once('clientReady')
  public onReady(@Context() [client]: ContextOf<'clientReady'>): void {
    this.logger.log(`Bot logged in as ${client.user.username}`);
  }

  @On('warn')
  public onWarn(@Context() [message]: ContextOf<'warn'>): void {
    this.logger.warn(message);
  }

  @On('messageCreate')
  public async onMessageCreate(
    @Context() [message]: ContextOf<'messageCreate'>,
  ): Promise<void> {
    if (message.author.bot) return;

    if (message.guildId) {
      const leveledUp = await this.levelsService.addXp(
        message.author.id,
        message.guildId,
        10,
      );

      if (leveledUp) {
        const newLevel = await this.levelsService.getUserLevel(
          message.author.id,
          message.guildId,
        );
        await message.reply(
          `Congratulations ${message.author.username}, you have leveled up to level ${newLevel}!`,
        );
      }
    }
  }
}

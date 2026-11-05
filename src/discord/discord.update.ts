import { Injectable, Logger } from '@nestjs/common';
import { On, Once, Context } from 'necord';
import type { ContextOf } from 'necord';
import { LevelsService } from './levels/levels.service.js';
import { SteamService } from '../steam/steam.service.js';

@Injectable()
export class DiscordUpdate {
  private readonly logger = new Logger(DiscordUpdate.name);
  constructor(
    private readonly levelsService: LevelsService,
    private readonly steamService: SteamService,
  ) {}

  @Once('clientReady')
  public async onReady(
    @Context() [client]: ContextOf<'clientReady'>,
  ): Promise<void> {
    this.logger.log(`Bot logged in as ${client.user.username}`);
    // try {
    //   const games = await this.steamService.getOwnedGames('76561199056137475');
    //   this.logger.log(`Fetched ${games.length} games`);
    // } catch (error) {
    //   this.logger.error(`... ${error instanceof Error ? error.message : String(error)}`);
    // }
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

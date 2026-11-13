import { PrismaService } from '../../database/prisma.service.js';
import { SteamService } from '../steam.service.js';
import { playedGames } from '../library/steam-library.utils.js';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class SteamSnapshotsService {
  private readonly logger = new Logger(SteamSnapshotsService.name);
  constructor(
    private prisma: PrismaService,
    private steamService: SteamService,
  ) {}

  @Cron('0 4 * * *', { timeZone: 'America/Argentina/Buenos_Aires' })
  async takeDailySnapshot() {
    this.logger.log('Starting daily snapshot task...');

    const users = await this.prisma.user.findMany({
      where: {
        steamId: {
          not: null,
        },
      },
      select: {
        id: true,
        steamId: true,
      },
    });

    const date = new Date();
    const snapshotDate = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );

    for (const user of users) {
      const steamId = user.steamId;
      if (!steamId) {
        this.logger.warn(
          `User ${user.id} does not have a linked Steam account.`,
        );
        continue;
      }

      try {
        const library = await this.steamService.getOwnedGames(steamId);
        const gamesPlayed = playedGames(library);

        for (const game of gamesPlayed) {
          await this.prisma.playtimeSnapshot.upsert({
            where: {
              userId_appId_date: {
                userId: user.id,
                appId: game.appid,
                date: snapshotDate,
              },
            },
            update: { playtimeForever: game.playtime_forever },
            create: {
              userId: user.id,
              appId: game.appid,
              date: snapshotDate,
              playtimeForever: game.playtime_forever,
            },
          });
        }
      } catch (error) {
        const errorName = error instanceof Error ? error.name : 'UnknownError';
        this.logger.error(
          `Error fetching the library for user ${user.id}:`,
          errorName,
        );
      }
    }

    this.logger.log('Daily snapshot task completed.');
  }
}

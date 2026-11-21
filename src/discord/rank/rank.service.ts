import { Injectable } from '@nestjs/common';
import { type RankEntry, calculateWeeklyRanking } from './rank.utils.js';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class RankService {
  constructor(private readonly prisma: PrismaService) {}

  async getWeeklyRanking(guildId: string): Promise<RankEntry[]> {
    const latest = await this.prisma.playtimeSnapshot.findFirst({
      orderBy: {
        date: 'desc',
      },
      select: {
        date: true,
      },
    });

    if (!latest) return [];

    const today = new Date(latest.date);
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setUTCDate(today.getUTCDate() - 7);

    const [current, previous] = await Promise.all([
      this.snapshotsAt(today, guildId),
      this.snapshotsAt(oneWeekAgo, guildId),
    ]);

    return calculateWeeklyRanking(current, previous);
  }

  private snapshotsAt(date: Date, guildId: string) {
    return this.prisma.playtimeSnapshot.findMany({
      where: {
        date,
        user: { members: { some: { guildId } } },
      },
      select: {
        userId: true,
        appId: true,
        playtimeForever: true,
      },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { levelForXp } from './levels.utils.js';

@Injectable()
export class LevelsService {
  constructor(private prisma: PrismaService) {}

  async getUserLevel(userId: string, guildId: string): Promise<number> {
    const user = await this.prisma.member.findUnique({
      where: { guildId_userId: { guildId: guildId, userId: userId } },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return levelForXp(user.xp);
  }

  async addXp(
    userId: string,
    guildId: string,
    xpToAdd: number,
  ): Promise<boolean> {
    const user = await this.prisma.member.findUnique({
      where: { guildId_userId: { guildId: guildId, userId: userId } },
    });

    if (user?.lastXpAt && Date.now() - user.lastXpAt.getTime() < 60000) {
      return false;
    }

    const levelBefore = levelForXp(user?.xp ?? 0);

    const saved = await this.prisma.member.upsert({
      where: { guildId_userId: { guildId: guildId, userId: userId } },
      update: {
        xp: { increment: xpToAdd },
        lastXpAt: new Date(),
      },
      create: {
        guild: {
          connectOrCreate: { where: { id: guildId }, create: { id: guildId } },
        },
        user: {
          connectOrCreate: { where: { id: userId }, create: { id: userId } },
        },
        xp: xpToAdd,
        lastXpAt: new Date(),
      },
    });

    const levelAfter = levelForXp(saved.xp);

    return levelAfter > levelBefore;
  }
}

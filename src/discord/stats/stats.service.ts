import { Injectable, Logger } from '@nestjs/common';
import { Stats } from './stats.utils.js';
import { getAvailablePoints } from './stats.utils.js';
import { PrismaService } from '../../database/prisma.service.js';
import { levelForXp } from '../levels/levels.utils.js';

@Injectable()
export class StatsService {
  private readonly logger = new Logger(StatsService.name);
  constructor(private prisma: PrismaService) {}

  async assignPoints(
    userId: string,
    guildId: string,
    whichStat: keyof Stats,
    pointsToAssign: number,
  ): Promise<number> {
    if (!Number.isInteger(pointsToAssign) || pointsToAssign <= 0) {
      throw new Error('Invalid amount');
    }

    return await this.prisma.$transaction(
      async (tx) => {
        const user = await tx.member.findUnique({
          where: { guildId_userId: { guildId: guildId, userId: userId } },
        });

        if (!user) {
          throw new Error('User not found');
        }

        const userStats = {
          luck: user.luck,
          charisma: user.charisma,
          endurance: user.endurance,
          skill: user.skill,
        };

        const level = levelForXp(user.xp);
        const availablePoints = getAvailablePoints(level, userStats);

        if (availablePoints < pointsToAssign) {
          throw new Error('Not enough available points to assign');
        }

        await tx.member.update({
          where: { guildId_userId: { guildId: guildId, userId: userId } },
          data: {
            [whichStat]: { increment: pointsToAssign },
          },
        });

        return availablePoints - pointsToAssign;
      },
      { isolationLevel: 'Serializable' },
    );
  }
}

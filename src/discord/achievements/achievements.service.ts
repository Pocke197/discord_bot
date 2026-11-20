import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import {
  type AchievementDefinition,
  ACHIEVEMENTS,
} from './achievements.definitions.js';
import { getNewAchievements } from './achievements.utils.js';

@Injectable()
export class AchievementsService {
  constructor(private prisma: PrismaService) {}

  async checkLevelAchievements(
    userId: string,
    guildId: string,
    level: number,
  ): Promise<AchievementDefinition[]> {
    const rows = await this.prisma.memberAchievement.findMany({
      where: {
        guildId: guildId,
        userId: userId,
      },
      select: {
        achievementId: true,
      },
    });

    const unlockedIds = new Set(rows.map((a) => a.achievementId));

    const newAchievements = getNewAchievements(
      ACHIEVEMENTS,
      'level',
      level,
      unlockedIds,
    );

    if (newAchievements.length === 0) {
      return [];
    }

    await this.prisma.memberAchievement.createMany({
      data: newAchievements.map((achievement) => ({
        userId,
        guildId,
        achievementId: achievement.id,
      })),
      skipDuplicates: true,
    });

    return newAchievements;
  }
}

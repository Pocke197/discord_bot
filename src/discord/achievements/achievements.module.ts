import { Module } from '@nestjs/common';
import { AchievementsService } from './achievements.service.js';
import { PrismaModule } from '../../database/prisma.module.js';
import { AchievementsListener } from './achievements.listener.js';

@Module({
  imports: [PrismaModule],
  providers: [AchievementsService, AchievementsListener],
  exports: [AchievementsService],
})
export class AchievementsModule {}

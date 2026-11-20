import { Module } from '@nestjs/common';
import { AchievementsService } from './achievements.service.js';
import { PrismaModule } from '../../database/prisma.module.js';
import { AchievementsListener } from './achievements.listener.js';
import { NotifierModule } from '../../notifier/notifier.module.js';

@Module({
  imports: [PrismaModule, NotifierModule],
  providers: [AchievementsService, AchievementsListener],
  exports: [AchievementsService],
})
export class AchievementsModule {}

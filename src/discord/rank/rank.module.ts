import { Module } from '@nestjs/common';
import { RankService } from './rank.service.js';
import { PrismaModule } from '../../database/prisma.module.js';
import { RankScheduler } from './rank.scheduler.js';

@Module({
  imports: [PrismaModule],
  providers: [RankService, RankScheduler],
  exports: [RankService],
})
export class RankModule {}

import { Module } from '@nestjs/common';
import { SteamSnapshotsService } from './steam-snapshots.service.js';
import { SteamModule } from '../steam.module.js';
import { PrismaModule } from '../../database/prisma.module.js';

@Module({
  imports: [SteamModule, PrismaModule],
  providers: [SteamSnapshotsService],
  exports: [SteamSnapshotsService],
})
export class SteamSnapshotsModule {}

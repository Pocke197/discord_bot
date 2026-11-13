import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DiscordModule } from './discord/discord.module.js';
import { HealthModule } from './health/health.module.js';
import { SteamAuthModule } from './steam/auth/steam-auth.module.js';
import { SteamSnapshotsModule } from './steam/snapshots/steam-snapshots.module.js';

@Module({
  imports: [
    DiscordModule,
    HealthModule,
    SteamAuthModule,
    SteamSnapshotsModule,
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}

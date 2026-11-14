import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { DiscordModule } from './discord/discord.module.js';
import { HealthModule } from './health/health.module.js';
import { SteamAuthModule } from './steam/auth/steam-auth.module.js';
import { SteamSnapshotsModule } from './steam/snapshots/steam-snapshots.module.js';
import { validateEnv } from './config/env.validation.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validateEnv,
      isGlobal: true,
    }),
    DiscordModule,
    HealthModule,
    SteamAuthModule,
    SteamSnapshotsModule,
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}

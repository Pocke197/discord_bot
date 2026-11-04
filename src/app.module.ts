import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { DiscordModule } from './discord/discord.module.js';
import { HealthModule } from './health/health.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY ?? 'YOUR_APP_KEY',
      appSecret: process.env.OBSERVE_APP_SECRET ?? 'YOUR_APP_SECRET',
      serviceId: 'project-name',
    }),
    DiscordModule,
    HealthModule,
  ],
})
export class AppModule {}

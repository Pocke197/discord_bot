import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AppUpdate} from './app.update.js';
import { NecordModule } from 'necord';
import { IntentsBitField } from 'discord.js';


export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY ?? 'YOUR_APP_KEY',
      appSecret: process.env.OBSERVE_APP_SECRET ?? 'YOUR_APP_SECRET',
      serviceId: 'project-name',
    }),
    NecordModule.forRoot({
        token: process.env.DISCORD_BOT_TOKEN ?? 'YOUR_BOT_TOKEN',
        intents: [IntentsBitField.Flags.Guilds]
    })
  ],
  controllers: [AppController],
  providers: [AppService, AppUpdate],
})
export class AppModule {}

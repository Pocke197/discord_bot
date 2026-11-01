import { Module } from '@nestjs/common';
import { DiscordUpdate } from './discord.update.js';
import { NecordModule } from 'necord';
import { IntentsBitField } from 'discord.js';

@Module({
  imports: [
    NecordModule.forRoot({
      token: process.env.DISCORD_BOT_TOKEN ?? 'YOUR_BOT_TOKEN',
      intents: [IntentsBitField.Flags.Guilds],
    }),
  ],
  providers: [DiscordUpdate],
})
export class DiscordModule {}

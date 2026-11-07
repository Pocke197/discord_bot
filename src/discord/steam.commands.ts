import { Injectable } from '@nestjs/common';
import { SteamAuthService } from '../steam/auth/steam-auth.service.js';
import { Context, SlashCommand } from 'necord';
import type { SlashCommandContext } from 'necord';
import { MessageFlags } from 'discord.js';
import { PrismaService } from '../database/prisma.service.js';

@Injectable()
export class SteamCommands {
  constructor(private steamAuthService: SteamAuthService) {}

  @SlashCommand({
    name: 'steam-login',
    description: 'Login to Steam',
  })
  public async steamLogin(@Context() [interaction]: SlashCommandContext) {
    const userId = interaction.user.id;
    try {
      const token = await this.steamAuthService.createLinkToken(userId);
      const authUrl = this.steamAuthService.buildLoginUrl(token);

      return interaction.reply({
        content: `Please login to Steam using the following link: ${authUrl}`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      const errorName = error instanceof Error ? error.name : 'UnknownError';

      console.error('Error creating link token:', errorName);

      return interaction.reply({
        content: 'Failed to create Steam login URL. Please try again later.',
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  @SlashCommand({
    name: 'steam-status',
    description: 'Check your Steam login status',
  })
  public async steamStatus(@Context() [interaction]: SlashCommandContext) {
    const userId = interaction.user.id;

    try {
      const steamId = await this.steamAuthService.getUserSteamId(userId);

      if (steamId) {
        return interaction.reply({
          content: `You are logged in to Steam with Steam ID: ${steamId}`,
          flags: MessageFlags.Ephemeral,
        });
      } else {
        return interaction.reply({
          content: 'You are not logged in to Steam.',
          flags: MessageFlags.Ephemeral,
        });
      }
    } catch (error) {
      const errorName = error instanceof Error ? error.name : 'UnknownError';
      console.error('Error fetching user from database:', errorName);

      return interaction.reply({
        content:
          'Failed to fetch your Steam login status. Please try again later.',
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}

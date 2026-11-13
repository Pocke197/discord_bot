import { Injectable, Logger } from '@nestjs/common';
import { SteamAuthService } from '../../steam/auth/steam-auth.service.js';
import { Context, SlashCommand } from 'necord';
import type { SlashCommandContext } from 'necord';
import { MessageFlags } from 'discord.js';

@Injectable()
export class SteamLinkCommands {
  private readonly logger = new Logger(SteamLinkCommands.name);

  constructor(private steamAuthService: SteamAuthService) {}

  @SlashCommand({
    name: 'steam-login',
    description: 'Log in to Steam',
  })
  public async steamLogin(@Context() [interaction]: SlashCommandContext) {
    const userId = interaction.user.id;

    try {
      if (await this.steamAuthService.isSteamIdLinked(userId)) {
        return interaction.reply({
          content: 'You are already logged in to Steam.',
          flags: MessageFlags.Ephemeral,
        });
      }

      const token = await this.steamAuthService.createLinkToken(userId);
      const authUrl = this.steamAuthService.buildLoginUrl(token);

      return interaction.reply({
        content: `Log in to Steam using the following link: ${authUrl}`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      const errorName = error instanceof Error ? error.name : 'UnknownError';

      this.logger.error('Error creating the link token:', errorName);

      return interaction.reply({
        content:
          'Unable to create the Steam login link. Please try again later.',
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
      this.logger.error(
        'Error fetching the user from the database:',
        errorName,
      );

      return interaction.reply({
        content:
          'Unable to fetch your Steam login status. Please try again later.',
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  @SlashCommand({
    name: 'steam-logout',
    description: 'Log out of Steam',
  })
  public async steamLogout(@Context() [interaction]: SlashCommandContext) {
    const userId = interaction.user.id;

    try {
      await this.steamAuthService.unlinkSteamId(userId);
      return interaction.reply({
        content: 'You have been logged out of Steam.',
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      const errorName = error instanceof Error ? error.name : 'UnknownError';
      this.logger.error(
        'Error unlinking the Steam ID from the user:',
        errorName,
        errorName,
      );

      return interaction.reply({
        content: 'Unable to log you out of Steam. Please try again later.',
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { Context, Options, SlashCommand } from 'necord';
import type { SlashCommandContext } from 'necord';
import { ProfileDto } from './profile.dto.js';
import { MessageFlags } from 'discord.js';
import { ProfileService } from '../../profile/profile.service.js';
import { buildProfileEmbed } from '../../embeds/profile/profile.embed.js';

@Injectable()
export class ProfileCommands {
  private readonly logger = new Logger(ProfileCommands.name);

  constructor(private profileService: ProfileService) {}

  @SlashCommand({
    name: 'profile',
    description: 'View the profile of a user',
  })
  public async profile(
    @Context() [interaction]: SlashCommandContext,
    @Options() options: ProfileDto,
  ) {
    if (interaction.guildId === null) {
      return await interaction.reply({
        content: 'This command can only be used in a server.',
        flags: MessageFlags.Ephemeral,
      });
    }

    const targetUser = options.user ?? interaction.user;

    try {
      const profile = await this.profileService.getProfile(
        targetUser.id,
        interaction.guildId,
      );
      const embed = buildProfileEmbed(targetUser, profile);

      return await interaction.reply({ embeds: [embed] });
    } catch (error) {
      const errorName = error instanceof Error ? error.name : 'UnknownError';
      this.logger.error('Error fetching the profile:', errorName);

      return await interaction.reply({
        content: 'Unable to fetch the profile. Please try again later.',
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}

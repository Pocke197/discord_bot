import { Injectable, Logger } from '@nestjs/common';
import { Context, Options, SlashCommand } from 'necord';
import type { SlashCommandContext } from 'necord';
import { ProfileDto } from './profile.dto.js';
import { AttachmentBuilder, MessageFlags } from 'discord.js';
import { ProfileService } from '../../profile/profile.service.js';
import { buildProfileEmbed } from '../../embeds/profile/profile.embed.js';
import { renderProfileCard } from '../../profile-card/profile-card.renderer.js';

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

    await interaction.deferReply();

    try {
      const profile = await this.profileService.getProfile(
        targetUser.id,
        interaction.guildId,
      );

      try {
        const buffer = await renderProfileCard({
          username: targetUser.displayName,
          avatarUrl: targetUser.displayAvatarURL({
            extension: 'png',
            size: 256,
          }),
          profile,
        });
        const attachment = new AttachmentBuilder(buffer, {
          name: 'profile.png',
        });

        return await interaction.editReply({ files: [attachment] });
      } catch (error) {
        const errorName = error instanceof Error ? error.name : 'UnknownError';
        this.logger.error(`Failed to render profile card: ${errorName}`);

        return await interaction.editReply({
          embeds: [buildProfileEmbed(targetUser, profile)],
        });
      }
    } catch (error) {
      const errorName = error instanceof Error ? error.name : 'UnknownError';
      this.logger.error(`Failed to fetch profile: ${errorName}`);

      return await interaction.editReply({
        content: 'Unable to fetch the profile. Please try again later.',
      });
    }
  }
}

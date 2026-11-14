import { EmbedBuilder } from 'discord.js';
import type { User } from 'discord.js';
import type { Profile } from '../../profile/profile.service.js';

const PROGRESS_BAR_LENGTH = 12;

export function buildProfileEmbed(user: User, profile: Profile) {
  const progress = profile.currentXp / profile.neededXp;
  const filled = Math.floor(progress * PROGRESS_BAR_LENGTH);
  const progressBar = `${'█'.repeat(filled)}${'░'.repeat(
    PROGRESS_BAR_LENGTH - filled,
  )}`;

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setAuthor({
      name: user.username,
      iconURL: user.displayAvatarURL({ extension: 'png', size: 128 }),
    })
    .setTitle(`Level ${profile.level}`)
    .setThumbnail(
      user.displayAvatarURL({
        extension: 'png',
        size: 256,
      }),
    )
    .addFields(
      {
        name: 'XP',
        value: `${progressBar}\n${profile.currentXp} / ${profile.neededXp} XP`,
        inline: false,
      },
      { name: 'Aura', value: profile.aura.toString(), inline: true },
      { name: 'Luck', value: profile.luck.toString(), inline: true },
      { name: 'Charisma', value: profile.charisma.toString(), inline: true },
      { name: 'Endurance', value: profile.endurance.toString(), inline: true },
      { name: 'Skill', value: profile.skill.toString(), inline: true },
    )
    .setFooter({
      text: `Available Points: ${profile.availablePoints.toString()}`,
    });

  const backgroundPicture = user.bannerURL({
    extension: 'png',
    size: 1024,
  });

  if (backgroundPicture) {
    embed.setImage(backgroundPicture);
  }

  return embed;
}

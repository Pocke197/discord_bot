import { EmbedBuilder, type User } from 'discord.js';
import { buildProfileEmbed } from './profile.embed.js';

const profile = {
  level: 5,
  xp: 300,
  aura: 13,
  luck: 0,
  charisma: 0,
  endurance: 0,
  skill: 0,
  availablePoints: 7,
};

const createUser = (banner?: string) =>
  ({
    username: 'test-user',
    displayAvatarURL: vi.fn(() => 'https://example.com/avatar.png'),
    bannerURL: vi.fn(() => banner),
  }) as unknown as User;

describe('buildProfileEmbed', () => {
  it('returns a Discord embed with the profile data', () => {
    const embed = buildProfileEmbed(createUser(), profile);

    expect(embed).toBeInstanceOf(EmbedBuilder);
    expect(embed.data.title).toContain('test-user');
    expect(embed.data.thumbnail?.url).toBe('https://example.com/avatar.png');
    expect(
      embed.data.fields?.find((field) => field.name === 'Level')?.value,
    ).toBe('5');
    expect(
      embed.data.fields?.find((field) => field.name === 'Aura')?.value,
    ).toBe('13');
    expect(embed.data.footer?.text).toContain('7');
    expect(embed.data.image).toBeUndefined();
  });

  it('adds the banner when the user has one', () => {
    const embed = buildProfileEmbed(
      createUser('https://example.com/banner.png'),
      profile,
    );

    expect(embed.data.image?.url).toBe('https://example.com/banner.png');
  });
});

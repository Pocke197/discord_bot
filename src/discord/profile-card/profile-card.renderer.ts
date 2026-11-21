import { join } from 'node:path';
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import type { Profile } from '../profile/profile.service.js';
import { ACHIEVEMENTS } from '../achievements/achievements.definitions.js';
import { getXpRatio } from './profile-card.utils.js';

const FONTS_DIR = join(process.cwd(), 'assets', 'fonts');

GlobalFonts.registerFromPath(
  join(FONTS_DIR, 'Inter-Regular.ttf'),
  'InterRegular',
);
GlobalFonts.registerFromPath(join(FONTS_DIR, 'Inter-Bold.ttf'), 'InterBold');

const CARD_WIDTH = 800;
const CARD_HEIGHT = 250;
const PADDING = 40;
const AVATAR_RADIUS = 80;

export type ProfileCardData = {
  username: string;
  avatarUrl: string;
  profile: Profile;
};

export const renderProfileCard = async (
  data: ProfileCardData,
): Promise<Buffer> => {
  const canvas = createCanvas(CARD_WIDTH, CARD_HEIGHT);
  const ctx = canvas.getContext('2d');
  const { profile } = data;

  ctx.fillStyle = '#1e1e1e';
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  const avatar = await loadImage(data.avatarUrl);
  const centerX = PADDING + AVATAR_RADIUS;
  const centerY = CARD_HEIGHT / 2;

  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, AVATAR_RADIUS, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(
    avatar,
    centerX - AVATAR_RADIUS,
    centerY - AVATAR_RADIUS,
    AVATAR_RADIUS * 2,
    AVATAR_RADIUS * 2,
  );
  ctx.restore();

  const textX = centerX + AVATAR_RADIUS + PADDING;

  ctx.fillStyle = '#ffffff';
  ctx.font = '36px InterBold';
  ctx.textAlign = 'left';
  ctx.fillText(data.username, textX, 70);

  ctx.textAlign = 'right';
  ctx.font = '24px InterBold';
  ctx.fillText(`Level ${profile.level}`, CARD_WIDTH - PADDING, 70);
  ctx.textAlign = 'left';

  const xpBarY = 95;
  const xpBarHeight = 20;
  const xpBarWidth = CARD_WIDTH - PADDING - textX;

  ctx.beginPath();
  ctx.fillStyle = '#4a4a4a';
  ctx.roundRect(textX, xpBarY, xpBarWidth, xpBarHeight, 10);
  ctx.fill();

  const xpRatio = getXpRatio(profile.currentXp, profile.neededXp);
  const xpFillWidth = xpBarWidth * xpRatio;
  if (xpFillWidth > 0) {
    ctx.beginPath();
    ctx.fillStyle = '#5865f2';
    ctx.roundRect(
      textX,
      xpBarY,
      Math.max(xpFillWidth, xpBarHeight),
      xpBarHeight,
      10,
    );
    ctx.fill();
  }

  ctx.fillStyle = '#ffffff';
  ctx.font = '20px InterRegular';
  ctx.fillText(`${profile.currentXp} / ${profile.neededXp} XP`, textX, 140);

  const { charisma, luck, skill, endurance, aura } = profile;

  ctx.font = '18px InterRegular';
  ctx.fillText(
    `CHA ${charisma} · LCK ${luck} · SKL ${skill} · END ${endurance}`,
    textX,
    180,
  );

  ctx.textAlign = 'right';
  ctx.fillText(`Aura ${aura}`, CARD_WIDTH - PADDING, 180);
  ctx.textAlign = 'left';

  ctx.fillText(
    `Achievements ${profile.achievements.length}/${ACHIEVEMENTS.length}`,
    textX,
    215,
  );

  return canvas.encode('png');
};

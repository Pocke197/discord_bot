import { Injectable, Logger } from '@nestjs/common';
import { extractSteamId } from './steam-auth.utils.js';
import { PrismaService } from '../../database/prisma.service.js';
import { randomBytes } from 'node:crypto';
import constants from '../../constants.js';
import { Prisma } from '../../generated/prisma/client.js';

@Injectable()
export class SteamAuthService {
  private readonly logger = new Logger(SteamAuthService.name);
  constructor(private prisma: PrismaService) {}

  getSteamIdFromOpenId(openId: string): string | null {
    return extractSteamId(openId);
  }

  private getPublicUrl(): string {
    const publicUrl = process.env.PUBLIC_URL?.replace(/\/+$/, '');
    if (!publicUrl) {
      throw new Error(
        'PUBLIC_URL must be configured to build the Steam login URL',
      );
    }

    return publicUrl;
  }

  buildReturnToUrl(token: string): string {
    const publicUrl = this.getPublicUrl();
    return `${publicUrl}/steam/callback?token=${encodeURIComponent(token)}`;
  }

  buildLoginUrl(token: string): string {
    this.logger.log('Building Steam login URL with token');

    const baseUrl = 'https://steamcommunity.com/openid/login';

    const params = new URLSearchParams({
      'openid.ns': 'http://specs.openid.net/auth/2.0',
      'openid.mode': 'checkid_setup',
      'openid.return_to': this.buildReturnToUrl(token),
      'openid.realm': this.getPublicUrl(),
      'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
      'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
    });

    return `${baseUrl}?${params.toString()}`;
  }

  async verify(
    params: Record<string, string>,
    expectedReturnTo: string,
  ): Promise<boolean> {
    if (
      params['openid.mode'] !== 'id_res' ||
      !params['openid.sig'] ||
      !params['openid.signed'] ||
      !params['openid.assoc_handle']
    ) {
      return false;
    }

    if (params['openid.ns'] !== 'http://specs.openid.net/auth/2.0') {
      return false;
    }

    if (params['openid.return_to'] !== expectedReturnTo) {
      return false;
    }

    const response = await fetch('https://steamcommunity.com/openid/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        ...params,
        'openid.mode': 'check_authentication',
      }),
    });

    if (!response.ok) {
      return false;
    }

    this.logger.log(
      'Steam OpenID verification response status:',
      response.status,
    );

    const text = await response.text();
    return text.includes('is_valid:true');
  }

  async createLinkToken(userId: string): Promise<string> {
    const token = randomBytes(32).toString('hex');
    await this.prisma.user.upsert({
      where: { id: userId },
      update: { steamLinkToken: token, steamLinkRequestedAt: new Date() },
      create: {
        id: userId,
        steamLinkToken: token,
        steamLinkRequestedAt: new Date(),
      },
    });
    return token;
  }

  async isSteamIdLinked(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { steamId: true },
    });
    return !!user && !!user.steamId;
  }

  async completeLink(token: string, steamId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { steamLinkToken: token },
    });

    if (!user || !user.steamLinkRequestedAt)
      throw new Error('Invalid or expired token');
    if (
      Date.now() >
      user.steamLinkRequestedAt.getTime() + constants.STEAM_LINK_TTL_MS
    )
      throw new Error('Token has expired');

    if (user.steamId) {
      throw new Error('This user already has a linked Steam account');
    }

    try {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { steamId, steamLinkToken: null, steamLinkRequestedAt: null },
      });

      return user.id;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new Error('Steam account is already linked to another user');
      }
      throw error;
    }
  }

  async getUserSteamId(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { steamId: true },
    });
    return user?.steamId ?? null;
  }

  async unlinkSteamId(userId: string): Promise<void> {
    await this.prisma.user.updateMany({
      where: { id: userId },
      data: { steamId: null },
    });
  }
}

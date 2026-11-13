import {
  BadRequestException,
  Controller,
  Get,
  Logger,
  Query,
} from '@nestjs/common';
import { SteamAuthService } from './steam-auth.service.js';
import { NotifierService } from '../../notifier/notifier.service.js';
import constants from '../../constants.js';

@Controller('steam')
export class SteamAuthController {
  private readonly logger = new Logger(SteamAuthController.name);

  constructor(
    private steamAuth: SteamAuthService,
    private notifierService: NotifierService,
  ) {}

  @Get('callback')
  async handleSteamCallback(
    @Query() query: Record<string, unknown>,
  ): Promise<string> {
    const { token } = query;

    if (!token || typeof token !== 'string') {
      throw new BadRequestException(
        'Missing or invalid token in query parameters',
      );
    }

    const openIdParams: Record<string, string> = {};
    for (const [key, value] of Object.entries(query)) {
      if (key.startsWith('openid.') && typeof value === 'string') {
        openIdParams[key] = value;
      }
    }

    const isVerified = await this.steamAuth.verify(
      openIdParams,
      this.steamAuth.buildReturnToUrl(token),
    );

    if (!isVerified) {
      this.logger.error('Steam OpenID verification failed');
    }

    const steamId = this.steamAuth.getSteamIdFromOpenId(
      openIdParams['openid.claimed_id'] ?? '',
    );

    if (!steamId) {
      throw new BadRequestException(
        'Failed to extract Steam ID from OpenID response',
      );
    }

    let discordId: string | null = null;

    try {
      discordId = await this.steamAuth.completeLink(token, steamId);
    } catch (error) {
      const errorName = error instanceof Error ? error.name : 'UnknownError';

      if (
        error instanceof Error &&
        constants.SAFE_MESSAGES.has(error.message)
      ) {
        throw new BadRequestException(error.message);
      }

      this.logger.error('Failed to complete Steam link', errorName);
      throw new BadRequestException('Failed to complete Steam link');
    }

    await this.notifierService.notifyUser(
      discordId,
      'Your Steam account has been linked successfully!',
    );

    return 'Steam account linked. You can return to Discord.';
  }
}

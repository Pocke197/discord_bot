import { Injectable } from '@nestjs/common';
import { extractSteamId } from './steam-auth.utils.js';

@Injectable()
export class SteamAuthService {
  getSteamIdFromOpenId(openId: string): string | null {
    return extractSteamId(openId);
  }

  buildLoginUrl(token: string): string {
    const baseUrl = 'https://steamcommunity.com/openid/login';
    const publicUrl = process.env.PUBLIC_URL?.replace(/\/+$/, '');

    if (!publicUrl) {
      throw new Error(
        'PUBLIC_URL must be configured to build the Steam login URL',
      );
    }

    const returnTo = `${publicUrl}/steam/callback?token=${encodeURIComponent(token)}`;
    const params = new URLSearchParams({
      'openid.ns': 'http://specs.openid.net/auth/2.0',
      'openid.mode': 'checkid_setup',
      'openid.return_to': returnTo,
      'openid.realm': publicUrl,
      'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
      'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
    });

    return `${baseUrl}?${params.toString()}`;
  }

  async verify(
    params: Record<string, string>,
    expected_return_to: string,
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

    if (params['openid.return_to'] !== expected_return_to) {
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

    const text = await response.text();
    return text.includes('is_valid:true');
  }
}

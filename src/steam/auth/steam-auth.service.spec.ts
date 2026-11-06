import { SteamAuthService } from './steam-auth.service.js';

describe('SteamAuthService', () => {
  const service = new SteamAuthService();

  it('builds a Steam login URL with a matching realm and callback', () => {
    process.env.PUBLIC_URL = 'https://example.com/';

    const loginUrl = new URL(service.buildLoginUrl('token with spaces'));
    const returnTo = new URL(loginUrl.searchParams.get('openid.return_to')!);

    expect(loginUrl.searchParams.get('openid.realm')).toBe(
      'https://example.com',
    );
    expect(returnTo.origin).toBe('https://example.com');
    expect(returnTo.pathname).toBe('/steam/callback');
    expect(returnTo.searchParams.get('token')).toBe('token with spaces');
  });

  it('verifies a valid Steam OpenID response', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response('ns:http://specs.openid.net/auth/2.0\nis_valid:true', {
          status: 200,
        }),
      );

    try {
      const verified = await service.verify({
        'openid.ns': 'http://specs.openid.net/auth/2.0',
        'openid.mode': 'id_res',
        'openid.identity':
          'https://steamcommunity.com/openid/id/76561198000000000',
        'openid.sig': 'test-signature',
        'openid.signed': 'ns,mode,identity,return_to,assoc_handle',
        'openid.assoc_handle': 'test-association',
        'openid.return_to': 'https://example.com/steam/callback',
      }, 'https://example.com/steam/callback');

      expect(verified).toBe(true);
      expect(fetchMock).toHaveBeenCalledOnce();
    } finally {
      fetchMock.mockRestore();
    }
  });

  it('throws when PUBLIC_URL is not configured', () => {
    delete process.env.PUBLIC_URL;

    expect(() => service.buildLoginUrl('token')).toThrow(
      'PUBLIC_URL must be configured to build the Steam login URL',
    );
  });
});

import { PrismaService } from '../../database/prisma.service.js';
import { Prisma } from '../../generated/prisma/client.js';
import constants from '../../constants.js';
import { SteamAuthService } from './steam-auth.service.js';

describe('SteamAuthService', () => {
  const prisma = {
    user: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  };

  let service: SteamAuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new SteamAuthService(prisma as unknown as PrismaService);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe('buildLoginUrl', () => {
    it('builds a Steam login URL with a matching realm and callback', () => {
      vi.stubEnv('PUBLIC_URL', 'https://example.com/');

      const loginUrl = new URL(service.buildLoginUrl('token with spaces'));
      const returnTo = new URL(loginUrl.searchParams.get('openid.return_to')!);

      expect(loginUrl.searchParams.get('openid.realm')).toBe(
        'https://example.com',
      );
      expect(returnTo.origin).toBe('https://example.com');
      expect(returnTo.pathname).toBe('/steam/callback');
      expect(returnTo.searchParams.get('token')).toBe('token with spaces');
    });

    it('throws when PUBLIC_URL is not configured', () => {
      vi.stubEnv('PUBLIC_URL', '');

      expect(() => service.buildLoginUrl('token')).toThrow(
        'PUBLIC_URL must be configured to build the Steam login URL',
      );
    });
  });

  describe('verify', () => {
    const returnTo = 'https://example.com/steam/callback';
    const validParams = {
      'openid.ns': 'http://specs.openid.net/auth/2.0',
      'openid.mode': 'id_res',
      'openid.identity':
        'https://steamcommunity.com/openid/id/76561198000000000',
      'openid.sig': 'test-signature',
      'openid.signed': 'ns,mode,identity,return_to,assoc_handle',
      'openid.assoc_handle': 'test-association',
      'openid.return_to': returnTo,
    };

    it('verifies a valid Steam OpenID response', async () => {
      const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('ns:http://specs.openid.net/auth/2.0\nis_valid:true', {
          status: 200,
        }),
      );

      const verified = await service.verify(validParams, returnTo);

      expect(verified).toBe(true);
      expect(fetchMock).toHaveBeenCalledOnce();
    });

    it.each([
      ['wrong mode', { 'openid.mode': 'cancel' }],
      ['missing signature', { 'openid.sig': '' }],
      ['missing signed', { 'openid.signed': '' }],
      ['missing assoc_handle', { 'openid.assoc_handle': '' }],
      ['wrong namespace', { 'openid.ns': 'http://evil.example/auth' }],
      [
        'different return_to',
        { 'openid.return_to': 'https://evil.example/cb' },
      ],
    ])('rejects without calling Steam: %s', async (_name, override) => {
      const fetchMock = vi.spyOn(globalThis, 'fetch');

      const verified = await service.verify(
        { ...validParams, ...override },
        returnTo,
      );

      expect(verified).toBe(false);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('rejects when Steam answers is_valid:false', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('ns:http://specs.openid.net/auth/2.0\nis_valid:false', {
          status: 200,
        }),
      );

      expect(await service.verify(validParams, returnTo)).toBe(false);
    });

    it('rejects when Steam answers with an HTTP error', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('error', { status: 500 }),
      );

      expect(await service.verify(validParams, returnTo)).toBe(false);
    });

    it('asks Steam to check_authentication, not to log in', async () => {
      const fetchMock = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(new Response('is_valid:true', { status: 200 }));

      await service.verify(validParams, returnTo);

      const body = fetchMock.mock.calls[0]![1]!.body as URLSearchParams;
      expect(body.get('openid.mode')).toBe('check_authentication');
      expect(body.get('openid.sig')).toBe('test-signature');
    });
  });

  describe('createLinkToken', () => {
    it('stores a random token for the user', async () => {
      const token = await service.createLinkToken('user-1');

      expect(token).toMatch(/^[0-9a-f]{64}$/);
      expect(prisma.user.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1' },
          update: expect.objectContaining({ steamLinkToken: token }),
          create: expect.objectContaining({
            id: 'user-1',
            steamLinkToken: token,
          }),
        }),
      );
    });

    it('generates a different token on each call', async () => {
      const first = await service.createLinkToken('user-1');
      const second = await service.createLinkToken('user-1');

      expect(first).not.toBe(second);
    });
  });

  describe('completeLink', () => {
    const steamId = '76561198000000000';

    it('rejects an unknown token', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.completeLink('x', steamId)).rejects.toThrow(
        'Invalid or expired token',
      );
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('rejects a token without request date', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        steamLinkRequestedAt: null,
      });

      await expect(service.completeLink('x', steamId)).rejects.toThrow(
        'Invalid or expired token',
      );
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('rejects an expired token', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        steamLinkRequestedAt: new Date(
          Date.now() - constants.STEAM_LINK_TTL_MS - 1000,
        ),
      });

      await expect(service.completeLink('x', steamId)).rejects.toThrow(
        'Token has expired',
      );
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('links the account and clears the token', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        steamLinkRequestedAt: new Date(Date.now() - 5000),
      });

      await service.completeLink('x', steamId);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: {
          steamId,
          steamLinkToken: null,
          steamLinkRequestedAt: null,
        },
      });
    });

    it('translates a unique violation into a clear error', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        steamLinkRequestedAt: new Date(Date.now() - 5000),
      });
      prisma.user.update.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('mensaje', {
          code: 'P2002',
          clientVersion: 'test',
        }),
      );

      await expect(service.completeLink('x', steamId)).rejects.toThrow(
        'Steam account is already linked to another user',
      );
    });

    it('rethrows unexpected database errors unchanged', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        steamLinkRequestedAt: new Date(Date.now() - 5000),
      });
      prisma.user.update.mockRejectedValue(new Error('db down'));

      await expect(service.completeLink('x', steamId)).rejects.toThrow(
        'db down',
      );
    });
  });

  describe('getUserSteamId', () => {
    it('returns null when the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const steamId = await service.getUserSteamId('user-1');

      expect(steamId).toBeNull();
    });

    it('returns null for a user without a linked account', async () => {
      prisma.user.findUnique.mockResolvedValue({
        steamId: null,
      });

      const steamId = await service.getUserSteamId('user-1');

      expect(steamId).toBeNull();
    });

    it('returns the Steam ID for a user with a linked account', async () => {
      prisma.user.findUnique.mockResolvedValue({
        steamId: '76561198000000000',
      });

      const steamId = await service.getUserSteamId('user-1');
      expect(steamId).toBe('76561198000000000');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: { steamId: true },
      });
    });

  });
});

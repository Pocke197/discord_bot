import { extractSteamId } from './steam-auth.utils.js';

describe('extractSteamId', () => {
  it('devuelve el ID de una URL correcta de Steam', () => {
    expect(
      extractSteamId('https://steamcommunity.com/openid/id/76561198000000000'),
    ).toBe('76561198000000000');
  });

  it('devuelve null para un dominio distinto con la misma ruta', () => {
    expect(
      extractSteamId('https://example.com/openid/id/76561198000000000'),
    ).toBeNull();
  });

  it('devuelve null cuando la URL está dentro de otro texto', () => {
    expect(
      extractSteamId(
        'Visita https://steamcommunity.com/openid/id/76561198000000000 ahora',
      ),
    ).toBeNull();
  });

  it('devuelve null para un ID de menos de 17 dígitos', () => {
    expect(
      extractSteamId('https://steamcommunity.com/openid/id/7656119800000000'),
    ).toBeNull();
  });

  it('devuelve null para un ID de más de 17 dígitos', () => {
    expect(
      extractSteamId('https://steamcommunity.com/openid/id/765611980000000000'),
    ).toBeNull();
  });

  it('devuelve null si hay texto después del número', () => {
    expect(
      extractSteamId('https://steamcommunity.com/openid/id/7656119800000000a'),
    ).toBeNull();
  });

  it('devuelve null para un texto vacío', () => {
    expect(extractSteamId('')).toBeNull();
  });
});

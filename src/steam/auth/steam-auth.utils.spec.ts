import { extractSteamId } from './steam-auth.utils.js';

describe('extractSteamId', () => {
  it.each([
    [
      'una URL correcta de Steam',
      'https://steamcommunity.com/openid/id/76561198000000000',
      '76561198000000000',
    ],
    [
      'un dominio distinto con la misma ruta',
      'https://example.com/openid/id/76561198000000000',
      null,
    ],
    [
      'una URL dentro de otro texto',
      'Visita https://steamcommunity.com/openid/id/76561198000000000 ahora',
      null,
    ],
    [
      'un ID de menos de 17 dígitos',
      'https://steamcommunity.com/openid/id/7656119800000000',
      null,
    ],
    [
      'un ID de más de 17 dígitos',
      'https://steamcommunity.com/openid/id/765611980000000000',
      null,
    ],
    [
      'texto después del número',
      'https://steamcommunity.com/openid/id/7656119800000000a',
      null,
    ],
    ['un texto vacío', '', null],
  ])('devuelve el resultado esperado para %s', (_case, input, expected) => {
    expect(extractSteamId(input)).toBe(expected);
  });
});

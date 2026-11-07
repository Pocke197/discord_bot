import {
  formatLibrary,
  getTopGamesByPlaytime,
  notPlayedGames,
  playtimeToHours,
} from './steam-library.utils.js';
import constants from '../../constants.js';

describe('getTopGamesByPlaytime', () => {
  it('devuelve los juegos más jugados en orden descendente', () => {
    const games = [
      { appid: 1, name: 'Juego con pocas horas', playtime_forever: 120 },
      { appid: 2, name: 'Juego más jugado', playtime_forever: 900 },
      { appid: 3, name: 'Juego intermedio', playtime_forever: 450 },
    ];

    expect(getTopGamesByPlaytime(games, 2)).toEqual([games[1], games[2]]);
  });

  it('no modifica la lista original', () => {
    const games = [
      { appid: 1, name: 'Juego con pocas horas', playtime_forever: 120 },
      { appid: 2, name: 'Juego más jugado', playtime_forever: 900 },
      { appid: 3, name: 'Juego intermedio', playtime_forever: 450 },
    ];
    const originalGames = [...games];

    getTopGamesByPlaytime(games, 2);

    expect(games).toEqual(originalGames);
  });

  it('devuelve una lista vacía cuando no hay juegos', () => {
    expect(getTopGamesByPlaytime([], 2)).toEqual([]);
  });

  it('devuelve todos los juegos cuando hay menos que el límite', () => {
    const games = [
      { appid: 1, name: 'Juego menos jugado', playtime_forever: 120 },
      { appid: 2, name: 'Juego más jugado', playtime_forever: 900 },
    ];

    expect(getTopGamesByPlaytime(games, 5)).toEqual([games[1], games[0]]);
  });

  it('usa el límite de la constante cuando no se especifica', () => {
    const games = Array.from(
      { length: constants.LIMIT_TOP_GAMES + 1 },
      (_, index) => ({
        appid: index + 1,
        name: `Juego ${index + 1}`,
        playtime_forever: index + 1,
      }),
    );

    expect(getTopGamesByPlaytime(games)).toHaveLength(
      constants.LIMIT_TOP_GAMES,
    );
  });

  it('conserva ambos juegos cuando hay un empate', () => {
    const games = [
      { appid: 1, name: 'Juego empatado 1', playtime_forever: 500 },
      { appid: 2, name: 'Juego empatado 2', playtime_forever: 500 },
    ];

    expect(getTopGamesByPlaytime(games, 2)).toEqual(
      expect.arrayContaining(games),
    );
    expect(getTopGamesByPlaytime(games, 2)).toHaveLength(2);
  });
});

describe('notPlayedGames', () => {
  it('devuelve una lista vacía cuando no hay juegos', () => {
    expect(notPlayedGames([])).toEqual([]);
  });

  it('devuelve una lista vacía cuando todos los juegos fueron jugados', () => {
    const games = [
      { appid: 1, name: 'Juego jugado', playtime_forever: 10 },
      { appid: 2, name: 'Otro juego jugado', playtime_forever: 120 },
    ];

    expect(notPlayedGames(games)).toEqual([]);
  });

  it('devuelve solo los juegos con cero minutos jugados', () => {
    const games = [
      { appid: 1, name: 'Juego sin abrir', playtime_forever: 0 },
      { appid: 2, name: 'Juego jugado', playtime_forever: 120 },
      { appid: 3, name: 'Otro juego sin abrir', playtime_forever: 0 },
    ];

    expect(notPlayedGames(games)).toEqual([games[0], games[2]]);
  });

  it('no considera nunca abierto un juego con un minuto jugado', () => {
    const games = [
      { appid: 1, name: 'Juego con un minuto', playtime_forever: 1 },
    ];

    expect(notPlayedGames(games)).toEqual([]);
  });

  it('no modifica la lista original', () => {
    const games = [
      { appid: 1, name: 'Juego sin abrir', playtime_forever: 0 },
      { appid: 2, name: 'Juego jugado', playtime_forever: 120 },
    ];
    const originalGames = [...games];

    notPlayedGames(games);

    expect(games).toEqual(originalGames);
  });
});

describe('playtimeToHours', () => {
  it.each([
    [0, 0],
    [2, 0],
    [30, 0.5],
    [50, 0.8],
    [60, 1],
    [90, 1.5],
    [60000, 1000],
  ])('convierte %d minutos en %d horas', (minutes, expectedHours) => {
    expect(playtimeToHours(minutes)).toBe(expectedHours);
  });
});

describe('formatLibrary', () => {
  it('muestra un mensaje de privacidad cuando la biblioteca está vacía', () => {
    expect(formatLibrary([])).toContain('private');
  });

  it('muestra el total, los juegos jugados, los no jugados y el top', () => {
    const games = [
      { appid: 1, name: 'Juego más jugado', playtime_forever: 900 },
      { appid: 2, name: 'Juego sin abrir', playtime_forever: 0 },
      { appid: 3, name: 'Segundo más jugado', playtime_forever: 450 },
    ];

    const message = formatLibrary(games);

    expect(message).toContain('Total games: 3');
    expect(message).toContain('Played games: 2');
    expect(message).toContain('Unplayed games: 1');
    expect(message).toContain('1. Juego más jugado');
  });

  it('ordena el top por tiempo jugado descendente', () => {
    const games = [
      { appid: 1, name: 'Segundo', playtime_forever: 450 },
      { appid: 2, name: 'Primero', playtime_forever: 900 },
    ];

    const message = formatLibrary(games);

    expect(message.indexOf('Primero')).toBeLessThan(message.indexOf('Segundo'));
  });

  it('no muestra los juegos que quedan fuera del límite del top', () => {
    const games = Array.from(
      { length: constants.LIMIT_TOP_GAMES + 1 },
      (_, index) => ({
        appid: index + 1,
        name: index === 0 ? 'Juego fuera del top' : `Juego top ${index}`,
        playtime_forever:
          index === 0 ? 1 : constants.LIMIT_TOP_GAMES + 2 - index,
      }),
    );

    expect(formatLibrary(games)).not.toContain('Juego fuera del top');
  });

  it('trunca los nombres de más de 50 caracteres', () => {
    const longGameName = 'A'.repeat(51);
    const message = formatLibrary([
      { appid: 1, name: longGameName, playtime_forever: 1000 },
    ]);

    expect(message).toContain(`1. ${longGameName.slice(0, 50)}`);
    expect(message).not.toContain(longGameName);
    expect(message.length).toBeLessThanOrEqual(constants.LIMIT_CHARACTERS);
  });
});

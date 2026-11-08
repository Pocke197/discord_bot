import {
  formatCommonGames,
  formatLibrary,
  getCommonGames,
  getTopGamesByPlaytime,
  notPlayedGames,
  playtimeToHours,
} from './steam-library.utils.js';
import constants from '../../constants.js';

const createGame = (appid: number, name: string, minutes: number) => ({
  appid,
  name,
  playtime_forever: minutes,
});

describe('getTopGamesByPlaytime', () => {
  it('devuelve los juegos más jugados en orden descendente', () => {
    const games = [
      createGame(1, 'Juego con pocas horas', 120),
      createGame(2, 'Juego más jugado', 900),
      createGame(3, 'Juego intermedio', 450),
    ];

    expect(getTopGamesByPlaytime(games, 2)).toEqual([games[1], games[2]]);
  });

  it('no modifica la lista original', () => {
    const games = [
      createGame(1, 'Juego con pocas horas', 120),
      createGame(2, 'Juego más jugado', 900),
      createGame(3, 'Juego intermedio', 450),
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
      createGame(1, 'Juego menos jugado', 120),
      createGame(2, 'Juego más jugado', 900),
    ];

    expect(getTopGamesByPlaytime(games, 5)).toEqual([games[1], games[0]]);
  });

  it('usa el límite de la constante cuando no se especifica', () => {
    const games = Array.from(
      { length: constants.LIMIT_TOP_GAMES + 1 },
      (_, index) => createGame(index + 1, `Juego ${index + 1}`, index + 1),
    );

    expect(getTopGamesByPlaytime(games)).toHaveLength(
      constants.LIMIT_TOP_GAMES,
    );
  });

  it('conserva ambos juegos cuando hay un empate', () => {
    const games = [
      createGame(1, 'Juego empatado 1', 500),
      createGame(2, 'Juego empatado 2', 500),
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
      createGame(1, 'Juego jugado', 10),
      createGame(2, 'Otro juego jugado', 120),
    ];

    expect(notPlayedGames(games)).toEqual([]);
  });

  it('devuelve solo los juegos con cero minutos jugados', () => {
    const games = [
      createGame(1, 'Juego sin abrir', 0),
      createGame(2, 'Juego jugado', 120),
      createGame(3, 'Otro juego sin abrir', 0),
    ];

    expect(notPlayedGames(games)).toEqual([games[0], games[2]]);
  });

  it('no considera nunca abierto un juego con un minuto jugado', () => {
    const games = [createGame(1, 'Juego con un minuto', 1)];

    expect(notPlayedGames(games)).toEqual([]);
  });

  it('no modifica la lista original', () => {
    const games = [
      createGame(1, 'Juego sin abrir', 0),
      createGame(2, 'Juego jugado', 120),
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

describe('getCommonGames', () => {
  it('devuelve solo los juegos en común entre dos usuarios', () => {
    const commonGame = createGame(1, 'Juego en común', 100);
    const firstLibrary = [
      commonGame,
      createGame(2, 'Solo del primer usuario', 50),
    ];
    const secondLibrary = [
      commonGame,
      createGame(3, 'Solo del segundo usuario', 75),
    ];

    expect(getCommonGames([firstLibrary, secondLibrary])).toEqual([
      createGame(1, 'Juego en común', 200),
    ]);
  });

  it('devuelve una lista vacía cuando no hay juegos en común', () => {
    const libraries = [
      [createGame(1, 'Juego del primer usuario', 10)],
      [createGame(2, 'Juego del segundo usuario', 20)],
    ];

    expect(getCommonGames(libraries)).toEqual([]);
  });

  it('devuelve una lista vacía cuando la lista de bibliotecas está vacía', () => {
    expect(getCommonGames([])).toEqual([]);
  });

  it('no incluye un juego que solo tienen dos de tres usuarios', () => {
    const libraries = [
      [
        createGame(1, 'Juego de dos usuarios', 10),
        createGame(2, 'Juego de los tres usuarios', 20),
      ],
      [
        createGame(1, 'Juego de dos usuarios', 30),
        createGame(2, 'Juego de los tres usuarios', 40),
      ],
      [createGame(2, 'Juego de los tres usuarios', 50)],
    ];

    expect(getCommonGames(libraries)).toEqual([
      createGame(2, 'Juego de los tres usuarios', 110),
    ]);
  });

  it('devuelve una lista vacía cuando hay una biblioteca vacía entre varias', () => {
    const libraries = [
      [createGame(1, 'Juego compartido', 10)],
      [],
      [createGame(1, 'Juego compartido', 20)],
    ];

    expect(getCommonGames(libraries)).toEqual([]);
  });

  it('no modifica las bibliotecas originales', () => {
    const firstLibrary = [createGame(1, 'Juego compartido', 10)];
    const secondLibrary = [createGame(1, 'Juego compartido', 20)];

    getCommonGames([firstLibrary, secondLibrary]);

    expect(firstLibrary[0].playtime_forever).toBe(10);
    expect(secondLibrary[0].playtime_forever).toBe(20);
  });

  it('devuelve toda la biblioteca ordenada por horas cuando hay un solo usuario', () => {
    const library = [
      createGame(1, 'Primer juego', 10),
      createGame(2, 'Segundo juego', 20),
    ];

    expect(getCommonGames([library])).toEqual([library[1], library[0]]);
  });

  it('devuelve varios juegos en común entre dos usuarios', () => {
    const firstLibrary = [
      createGame(1, 'Primer juego compartido', 10),
      createGame(2, 'Segundo juego compartido', 20),
      createGame(3, 'Solo del primer usuario', 30),
    ];
    const secondLibrary = [
      createGame(1, 'Primer juego compartido', 40),
      createGame(2, 'Segundo juego compartido', 50),
      createGame(4, 'Solo del segundo usuario', 60),
    ];

    expect(getCommonGames([firstLibrary, secondLibrary])).toEqual([
      createGame(2, 'Segundo juego compartido', 70),
      createGame(1, 'Primer juego compartido', 50),
    ]);
  });
});

describe('formatLibrary', () => {
  it('muestra un mensaje de privacidad cuando la biblioteca está vacía', () => {
    expect(formatLibrary([])).toContain('private');
  });

  it('muestra el total, los juegos jugados, los no jugados y el top', () => {
    const games = [
      createGame(1, 'Juego más jugado', 900),
      createGame(2, 'Juego sin abrir', 0),
      createGame(3, 'Segundo más jugado', 450),
    ];

    const message = formatLibrary(games);

    expect(message).toContain('Total games: 3');
    expect(message).toContain('Played games: 2');
    expect(message).toContain('Unplayed games: 1');
    expect(message).toContain('1. Juego más jugado');
  });

  it('ordena el top por tiempo jugado descendente', () => {
    const games = [
      createGame(1, 'Segundo', 450),
      createGame(2, 'Primero', 900),
    ];

    const message = formatLibrary(games);

    expect(message.indexOf('Primero')).toBeLessThan(message.indexOf('Segundo'));
  });

  it('no muestra los juegos que quedan fuera del límite del top', () => {
    const games = Array.from(
      { length: constants.LIMIT_TOP_GAMES + 1 },
      (_, index) =>
        createGame(
          index + 1,
          index === 0 ? 'Juego fuera del top' : `Juego top ${index}`,
          index === 0 ? 1 : constants.LIMIT_TOP_GAMES + 2 - index,
        ),
    );

    expect(formatLibrary(games)).not.toContain('Juego fuera del top');
  });

  it('trunca los nombres de más de 50 caracteres', () => {
    const longGameName = 'A'.repeat(51);
    const message = formatLibrary([createGame(1, longGameName, 1000)]);

    expect(message).toContain(`1. ${longGameName.slice(0, 50)}`);
    expect(message).not.toContain(longGameName);
    expect(message.length).toBeLessThanOrEqual(constants.LIMIT_CHARACTERS);
  });
});

describe('formatCommonGames', () => {
  it('muestra una lista corta completa y numerada', () => {
    const games = [
      createGame(1, 'Primer juego', 0),
      createGame(2, 'Segundo juego', 0),
      createGame(3, 'Tercer juego', 0),
    ];
    const message = formatCommonGames(games, 1000);
    expect(message).toBe('1. Primer juego\n2. Segundo juego\n3. Tercer juego');
  });

  it('indica cuántos juegos quedan fuera del límite', () => {
    const games = Array.from(
      { length: constants.LIMIT_COMMON_GAMES + 3 },
      (_, index) => createGame(index + 1, `Juego ${index + 1}`, 0),
    );

    const message = formatCommonGames(games, 1000);

    expect(message).toContain('and 3 more');
    expect(message).toContain(
      `${constants.LIMIT_COMMON_GAMES}. Juego ${constants.LIMIT_COMMON_GAMES}`,
    );
  });

  it('corta los nombres a 50 caracteres', () => {
    const longGameName = 'A'.repeat(60);

    const message = formatCommonGames([createGame(1, longGameName, 0)], 1000);

    expect(message).toBe(`1. ${longGameName.slice(0, 50)}`);
    expect(message).not.toContain(longGameName);
  });

  it('no supera el máximo de caracteres', () => {
    const games = Array.from(
      { length: constants.LIMIT_TOP_GAMES },
      (_, index) => createGame(index + 1, `Juego ${index + 1}`, 0),
    );

    const message = formatCommonGames(games, 40);

    expect(message.length).toBeLessThanOrEqual(40);
    expect(message).toContain('1. Juego 1');
  });

  it('devuelve un texto vacío cuando el máximo es cero', () => {
    expect(formatCommonGames([createGame(1, 'Juego', 0)], 0)).toBe('');
  });
});

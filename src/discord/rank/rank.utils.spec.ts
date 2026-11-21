import { calculateWeeklyRanking, type SnapshotPlaytime } from './rank.utils.js';

const snap = (
  userId: string,
  appId: number,
  playtimeForever: number,
): SnapshotPlaytime => ({ userId, appId, playtimeForever });

describe('calculateWeeklyRanking', () => {
  it('calcula las horas jugadas durante la semana', () => {
    expect(
      calculateWeeklyRanking(
        [snap('user-1', 730, 720)],
        [snap('user-1', 730, 600)],
      ),
    ).toEqual([{ userId: 'user-1', hours: 2 }]);
  });

  it('suma varios juegos del mismo usuario', () => {
    expect(
      calculateWeeklyRanking(
        [snap('user-1', 730, 660), snap('user-1', 570, 240)],
        [snap('user-1', 730, 600), snap('user-1', 570, 120)],
      ),
    ).toEqual([{ userId: 'user-1', hours: 3 }]);
  });

  it('cuenta desde cero un juego nuevo', () => {
    expect(
      calculateWeeklyRanking(
        [snap('user-1', 730, 600), snap('user-1', 570, 120)],
        [snap('user-1', 730, 600)],
      ),
    ).toEqual([{ userId: 'user-1', hours: 2 }]);
  });

  it('no incluye a un usuario nuevo', () => {
    expect(
      calculateWeeklyRanking(
        [snap('old-user', 730, 720), snap('new-user', 570, 120)],
        [snap('old-user', 730, 600)],
      ),
    ).toEqual([{ userId: 'old-user', hours: 2 }]);
  });

  it('no resta cuando los minutos actuales son menores', () => {
    expect(
      calculateWeeklyRanking(
        [snap('user-1', 730, 600)],
        [snap('user-1', 730, 720)],
      ),
    ).toEqual([]);
  });

  it('no incluye a quien no jugó durante la semana', () => {
    expect(
      calculateWeeklyRanking(
        [snap('user-1', 730, 600)],
        [snap('user-1', 730, 600)],
      ),
    ).toEqual([]);
  });

  it('ordena primero al usuario que jugó más', () => {
    expect(
      calculateWeeklyRanking(
        [snap('user-1', 730, 720), snap('user-2', 730, 960)],
        [snap('user-1', 730, 600), snap('user-2', 730, 600)],
      ),
    ).toEqual([
      { userId: 'user-2', hours: 6 },
      { userId: 'user-1', hours: 2 },
    ]);
  });

  it('devuelve un arreglo vacío para arreglos vacíos', () => {
    expect(calculateWeeklyRanking([], [])).toEqual([]);
  });
});

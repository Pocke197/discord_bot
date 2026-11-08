import { parseMentionedUsersIds } from './mentions.utils.js';

describe('parseMentionedUsersId', () => {
  it('devuelve el ID de una mención', () => {
    expect(parseMentionedUsersIds('<@123456789>')).toEqual(['123456789']);
  });

  it('devuelve varias menciones separadas por espacios', () => {
    expect(parseMentionedUsersIds('<@123> <@456>')).toEqual(['123', '456']);
  });

  it('devuelve menciones pegadas, sin espacios', () => {
    expect(parseMentionedUsersIds('<@123><@456>')).toEqual(['123', '456']);
  });

  it('incluye una sola vez la misma mención repetida', () => {
    expect(parseMentionedUsersIds('<@123> <@123>')).toEqual(['123']);
  });

  it('ignora el texto mezclado con las menciones', () => {
    expect(parseMentionedUsersIds('Hola <@123>, revisá esto <@456>.')).toEqual([
      '123',
      '456',
    ]);
  });

  it('acepta el formato viejo <@!id>', () => {
    expect(parseMentionedUsersIds('<@!123456789>')).toEqual(['123456789']);
  });

  it('no cuenta las menciones de roles', () => {
    expect(parseMentionedUsersIds('<@&123456789>')).toEqual([]);
  });

  it.each(['@everyone texto', ''])(
    'devuelve una lista vacía para "%s"',
    (text) => {
      expect(parseMentionedUsersIds(text)).toEqual([]);
    },
  );
});

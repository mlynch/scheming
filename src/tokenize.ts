//
// Tokenizing - reading a source file and building a stream of tokens to be parsed
//

export enum TokenType {
  Unknown = 'UNKNOWN',
  Null = 'NULL',
  ParenOpen = 'PAREN_OPEN',
  ParenClose = 'PAREN_CLOSE',
  Whitespace = 'WHITESPACE',
  Operator = 'OPERATOR',
  Number = 'NUMBER',
  Letter = 'LETTER',
}

export interface Token {
  type: TokenType;
  position?: number;
  value?: string;
}

export const NoTokenTypeMatch = [0, { type: TokenType.Null} ] as [number, Token];

export const isWhitespace = (c: string) => [' ', '\t', '\n', '\r'].indexOf(c) >= 0;

export const isOperator = (c: string) => ['*', '/', '+', '-'].indexOf(c) >= 0;

export const isNumber = (c: string) => !isNaN(parseFloat(c));

export const isIdentifier = (c: string) => /[\w\-]+/.test(c);

export const isLetter = (c: string) => c.toLowerCase() !== c.toUpperCase();

const advance = (newTokenType: TokenType, char: string, index: number, amount: number): [number, Token] => {
  return [index + amount, {
    type: newTokenType,
    position: index,
    value: char
  }];
}

const tokenizers = [
  (i, c) => c === '('         ? advance(TokenType.ParenOpen,  c, i, 1) : NoTokenTypeMatch,
  (i, c) => c === ')'         ? advance(TokenType.ParenClose, c, i, 1) : NoTokenTypeMatch,
  (i, c) => isWhitespace(c)   ? advance(TokenType.Whitespace, c, i, 1) : NoTokenTypeMatch,
  (i, c) => isOperator(c)     ? advance(TokenType.Operator,   c, i, 1) : NoTokenTypeMatch,
  (i, c) => isLetter(c)       ? advance(TokenType.Letter,     c, i, 1) : NoTokenTypeMatch,
  (i, c) => isNumber(c)       ? advance(TokenType.Number,     c, i, 1) : NoTokenTypeMatch,
  (i, c) =>                     advance(TokenType.Unknown,    c, i, 1)
];


// Convert a program string into a stream of tokens
export const tokenize = (program: string) => {
  let i = 0;
  let newI;
  let token = { type: TokenType.Null };
  let c = program[0];
  const tokens = [];

  while (c) {
    for (let t of tokenizers) {
      [newI, token] = t(i, c);
      if (token.type !== TokenType.Null) {
        i = newI;
        tokens.push(token);
        break;
      }
    }

    c = program[i];
  }

  return tokens;
}

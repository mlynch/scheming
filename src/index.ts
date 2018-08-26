const fs = require('fs'),
      util = require('util');

const readFile = util.promisify(fs.readFile);


enum TokenType {
  Unknown = 'UNKNOWN',
  Null = 'NULL',
  ParenOpen = 'PAREN_OPEN',
  ParenClose = 'PAREN_CLOSE',
  Whitespace = 'WHITESPACE',
  Operator = 'OPERATOR',
  Number = 'NUMBER',
  Letter = 'LETTER',
}

enum SymbolType {
  Function = 'FUNCTION',
  FunctionDeclaration = 'FUNCTION_DECLARATION',
}


interface Symbol {
  type: SymbolType;
  value: string;
}

interface Token {
  type: TokenType;
  position?: number;
  value?: string;
}

const NoTokenTypeMatch = [0, { type: TokenType.Null} ] as [number, Token];

const isWhitespace = (c: string) => {
  return [' ', '\t', '\n', '\r'].indexOf(c) >= 0;
}

const isOperator = (c: string) => {
  return ['*', '/', '+', '-'].indexOf(c) >= 0;
}

const isNumber = (c: string) => {
  return !isNaN(parseFloat(c));
}

const isLetter = (c: string) => {
  return c.toLowerCase() !== c.toUpperCase();
}

const advance = (newTokenType: TokenType, char: string, index: number, amount: number): [number, Token] => {
  return [index + amount, {
    type: newTokenType,
    position: index,
    value: char
  }];
}

const interp = (_program: any) => {
};

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
const tokenize = (program: string) => {
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

const parse = (tokens: Token[]) => {
  // let token = tokens[0];
  /*
  while (token) {
  }
   */
  tokens.forEach((t) => process.stdout.write(t.value));
};

const load = async (path: string) => {
  const fileContents = await readFile(path, 'utf8');
  return fileContents;
}

const run = async () => {
  if (process.argv.length < 3) {
    console.error('Usage: scheming [file]');
    process.exit(1);
    return;
  }
  const arg = process.argv[2];
  try {
    interp(parse(tokenize(await load(arg))));
  } catch(e) {
    console.error('Unable to run program', e);
  }
}

run();

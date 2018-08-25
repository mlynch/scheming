const fs = require('fs'),
      util = require('util');

const readFile = util.promisify(fs.readFile);


enum Token {
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

const NoTokenMatch = [0, Token.Null] as [number, Token];

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

const advance = (newToken: Token, index: number, amount: number): [number, Token] => {
  return [index + amount, newToken];
}

const interp = (_program: any) => {
};

const tokenizers = [
  (i, c) => c === '('         ? advance(Token.ParenOpen, i, 1) : NoTokenMatch,
  (i, c) => c === ')'         ? advance(Token.ParenClose, i, 1) : NoTokenMatch,
  (i, c) => isWhitespace(c)   ? advance(Token.Whitespace, i, 1) : NoTokenMatch,
  (i, c) => isOperator(c)     ? advance(Token.Operator, i, 1) : NoTokenMatch,
  (i, c) => isLetter(c)       ? advance(Token.Letter, i, 1) : NoTokenMatch,
  (i, c) => isNumber(c)       ? advance(Token.Number, i, 1) : NoTokenMatch,
  (i, _c) => advance(Token.Unknown, i, 1)
];


// Convert a program string into a stream of tokens
const tokenize = (program: string) => {
  let i = 0;
  let newI;
  let token = Token.Null;
  let c = program[0];
  const tokens = [];

  while (c) {
    for (let t of tokenizers) {
      [newI, token] = t(i, c);
      if (token !== Token.Null) {
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
  console.log('Parsing tokens');
  tokens.forEach((t) => process.stdout.write(t));
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

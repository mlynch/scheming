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

enum SyntaxNodeType {
  Program = 'PROGRAM',
  Expression = 'EXPRESSION',
  Definition = 'DEFINTION',
  Number = 'NUMBER',
  String = 'STRING',
  Reference = 'REFERENCE',
  Function = 'FUNCTION',
  FunctionDeclaration = 'FUNCTION_DECLARATION',
}


interface SyntaxNode {
  type: SyntaxNodeType;
  children: SyntaxNode[];
  parent: SyntaxNode,
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

const isReference = (c: string) => {
  return /\w+/.test(c);
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

//
// Tokenizing - reading a source file and building a stream of tokens to be parsed
//

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

//
// Parsing - parsing a stream of tokens and building an Abstract Syntax Tree
//

const parse = (tokens: Token[]) => {
  // let token = tokens[0];
  /*
  while (token) {
  }
   */
  tokens.forEach((t) => process.stdout.write(t.value));

  const root = {
    type: SyntaxNodeType.Program,
    children: [],
    value: '',
    parent: null
  }

  const stack = [root];

  for (let token of tokens) {
    // console.log('TOKEN', token.type);
    // Get the current (deepest) node
    const c = peek(stack);
    console.log('Node', c.type, c.value);
    switch (token.type) {
      case TokenType.ParenOpen: {
        let node;
        if (c.type === SyntaxNodeType.Definition) {
          node = makeNode(SyntaxNodeType.Function, c);
        } else {
          node = makeNode(SyntaxNodeType.Expression, c);
        }
        //stack.pop();
        //stack.push(addChildToNode(c, node));
        c.children.push(node);
        stack.push(node);
        break;
      } 
      case TokenType.Letter:
        if (c.type === SyntaxNodeType.Reference ||
            c.type === SyntaxNodeType.Function) {
          c.value = c.value + token.value;
        }
      case TokenType.Number: {
        // Concatenate the expression symbol value
        if (c.type === SyntaxNodeType.Expression && !c.children.length) {
          //stack.pop();
          //stack.push(concatNodeValue(c, token.value));
          c.value = c.value + token.value;
        }
        break;
      }
      case TokenType.ParenClose:
        stack.pop();
        break;
      case TokenType.Whitespace: {
        // Whitespace delimits expressions
        let node;
        console.log(`Whitespace hit`, c.type, c.value);
        if (isDefineExpr(c)) {
          node = makeNode(SyntaxNodeType.Definition, c, c.value);
        } else if (isNumber(c.value)) {
          node = makeNode(SyntaxNodeType.Number, c, c.value);
        } else if (isReference(c.value)) {
          node = makeNode(SyntaxNodeType.Reference, c, c.value);
        }
        if (node) {
          stack.push(node);
          c.children.push(node);
          node.parent = c;
        }
        break;
      }
    }
  }

  console.log(stack.length);
  //printAST(stack[0]);
  printAST(stack[0]);
};

const makeNode = (type: SyntaxNodeType, parent: SyntaxNode = null, value: string = ''): SyntaxNode => {
  console.log('Making node', type, value);
  return {
    type,
    value,
    children: [],
    parent
  }
}

const concatNodeValue = (node: SyntaxNode, value: string): SyntaxNode => {
  return {
    ...node,
    value: "" + node.value + value
  }
}

const addChildToNode = (node: SyntaxNode, child: SyntaxNode): SyntaxNode => {
  return {
    ...node,
    children: [...node.children, child]
  }
}

const isDefineExpr = (node: SyntaxNode) => {
  return node.value === 'define';
}

const peek = (stack) => stack[stack.length-1];


const printAST = (tree: SyntaxNode, depth = 0) => {
  console.log(Array(depth).fill(' ').join(''), tree.type, tree.value);
  for (let node of tree.children) {
    printAST(node, depth + 1);
  }
}

//
// Evaluating - executing a program represented by an Abstract Syntax Tree
//

const evaluate = (_program: any) => {
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
    evaluate(parse(tokenize(await load(arg))));
  } catch(e) {
    console.error('Unable to run program', e);
  }
}

run();

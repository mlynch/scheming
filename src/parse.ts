import { Token, TokenType, isNumber, isIdentifier } from './tokenize';

//
// Parsing - parsing a stream of tokens and building an Abstract Syntax Tree
//

export enum SyntaxNodeType {
  Program = 'PROGRAM',
  Constant = 'CONSTANT',
  Expression = 'EXPRESSION',
  String = 'STRING',
  Identifier = 'IDENTIFIER',
  Function = 'FUNCTION',
  FunctionName = 'FUNCTION_NAME',
  FunctionParameter = 'FUNCTION_PARAMETER',
  FunctionBody = 'FUNCTION_BODY',
  Definition = 'DEFINITION',
  FunctionCall = 'FUNCTION_CALL',
  FunctionArgument = 'FUNCTION_ARGUMENT'
}


export interface SyntaxNode {
  type: SyntaxNodeType;
  children: SyntaxNode[];
  parent: SyntaxNode,
  value: string;
}


const makeNode = (type: SyntaxNodeType, parent: SyntaxNode = null, value: string = ''): SyntaxNode => {
  console.log('Making node', type, value);
  const newNode = {
    type,
    value,
    children: [],
    parent
  }
  parent && parent.children.push(newNode);
  return newNode;
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

export const parse = (tokens: Token[]) => {
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
    console.log('Node', c.type, c.value, 'Token:', token.type, token.value);
    switch (token.type) {
      case TokenType.ParenOpen: {
        let node;
        switch (c.type) {
          case SyntaxNodeType.Expression:
            node = makeNode(SyntaxNodeType.Function, c);
            break;
          case SyntaxNodeType.FunctionBody:
            node = makeNode(SyntaxNodeType.FunctionCall, c);
            break;
          default:
            node = makeNode(SyntaxNodeType.Expression, c);
        }
        //stack.pop();
        //stack.push(addChildToNode(c, node));
        stack.push(node);
        break;
      } 
      case TokenType.Letter:
        switch (c.type) {
          case SyntaxNodeType.Identifier:
          case SyntaxNodeType.FunctionName:
          case SyntaxNodeType.FunctionParameter:
          case SyntaxNodeType.FunctionBody: {
            c.value = c.value + token.value;
            break;
          }
          case SyntaxNodeType.FunctionCall: {
            const node = makeNode(SyntaxNodeType.Identifier, c, token.value);
            stack.push(node);
            break;
          }
          case SyntaxNodeType.Function: {
            const node = makeNode(SyntaxNodeType.FunctionName, c, token.value);
            stack.push(node);
            break;
          }
        }
        // Fall through
      case TokenType.Operator:
      case TokenType.Number: {
        // Concatenate the expression symbol value
        if (token.type == TokenType.Number) {
          console.log('Token number', c.type, c.value);
        }
        switch (c.type) {
          case SyntaxNodeType.Constant:
            c.value = c.value + token.value;
            break;
          case SyntaxNodeType.Expression:
          case SyntaxNodeType.FunctionCall:
            if (!c.children.length) {
              c.value = c.value + token.value;
            } else if(token.type === TokenType.Number) {
              const node = makeNode(SyntaxNodeType.Constant, c, token.value);
              stack.push(node);
            }
          break;
        }
        break;
      }
      case TokenType.ParenClose:
        console.log('Paren close', c.type, c.value);
        stack.pop();
        switch (c.type) {
          case SyntaxNodeType.Identifier:
          case SyntaxNodeType.Constant:
            stack.pop();
            break;
          case SyntaxNodeType.FunctionParameter:
            stack.pop();
            break;
          case SyntaxNodeType.FunctionBody:
            // Pop function
            stack.pop();
            // Pop define
            //stack.pop();
            break;
        }
        break;
      case TokenType.Whitespace: {
        // Whitespace delimits expressions
        let node;
        console.log(`Whitespace hit`, c.type, c.value, token.value);
        switch (c.type) {
          case SyntaxNodeType.Identifier:
          case SyntaxNodeType.Constant:
            stack.pop();
            break;
          case SyntaxNodeType.Function:
            node = makeNode(SyntaxNodeType.FunctionBody, c);
            stack.push(node);
            break;
          case SyntaxNodeType.FunctionName:
            node = makeNode(SyntaxNodeType.FunctionParameter, c, '');
            stack.push(node);
            break;
          case SyntaxNodeType.FunctionParameter:
            stack.pop();
            node = makeNode(SyntaxNodeType.FunctionParameter, peek(stack), '');
            stack.push(node);

            break;
          case SyntaxNodeType.FunctionCall:
            node = makeNode(SyntaxNodeType.Identifier, c, '');
            stack.push(node);
            break;
          default:
            if (isDefineExpr(c)) {
              //node = makeNode(SyntaxNodeType.Definition, c, c.value);
            } else if (isNumber(c.value)) {
              node = makeNode(SyntaxNodeType.Constant, c, c.value);
            } else if (isIdentifier(c.value)) {
              node = makeNode(SyntaxNodeType.Identifier, c, c.value);
              stack.push(node);
              stack.pop();
            }
        }

        if (node) {
        }
        break;
      }
    }
  }

  console.log(stack.length);
  //printAST(stack[0]);
  printAST(stack[0]);

  return stack[0];
};

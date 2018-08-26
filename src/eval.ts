import { SyntaxNode, SyntaxNodeType } from './parse';

//
// Evaluating - executing a program represented by an Abstract Syntax Tree
//

export const evaluate = (program: SyntaxNode) => {
  const output = _eval(program);
  console.log('>', output);
};

const _eval = (node: SyntaxNode) => {
  console.log('Evaluating', node.type, node.value);
  switch (node.type) {
    case SyntaxNodeType.Constant:
      return node.value;
    case SyntaxNodeType.Expression: {
      let value;
      for (let child of node.children) {
        // Not right
        value = _eval(child);
      }
      return value;
    }
    case SyntaxNodeType.Program: {
      let value;
      for (let child of node.children) {
        value = _eval(child);
      }
      return value;
    }
  }
}

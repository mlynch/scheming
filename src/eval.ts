import { SyntaxNode, SyntaxNodeType } from './parse';

//
// Evaluating - executing a program represented by an Abstract Syntax Tree
//

interface Context {
  defns: { [key:string]: SyntaxNode };
  parent: Context;
}

const makeContext = (parent: Context = null) : Context => {
  return {
    defns: {},
    parent
  }
}

const assign = (tree: SyntaxNode, context: Context) => {
  const a = (name, node: SyntaxNode) => {
    console.log('ASSIGN', name, node.type);
    context.defns[name] = node;
  }

  const first = tree.children[0];
  switch (first.type) {
    case SyntaxNodeType.Function: {
      const name = first.children[0].value;
      a(name, first);
      break;
    }
  }
  return tree;
}

export const evaluate = (program: SyntaxNode) => {
  const output = _eval(program, makeContext());
  console.log('>', output);
};


const _eval = (node: SyntaxNode, context: Context) => {
  console.log('Evaluating', node.type, node.value);
  switch (node.type) {
    case SyntaxNodeType.Constant:
      return node.value;
    case SyntaxNodeType.Definition:
      return assign(node, context);
    case SyntaxNodeType.Expression: {
      switch (node.value) {
        case 'define':
          return assign(node, context);
      }

      let value;
      for (let child of node.children) {
        // Not right
        value = _eval(child, makeContext(context));
      }
      return value;
    }
    case SyntaxNodeType.Function: {

    }
    case SyntaxNodeType.Program: {
      let value;
      for (let child of node.children) {
        value = _eval(child, makeContext(context));
      }
      return value;
    }
  }
}

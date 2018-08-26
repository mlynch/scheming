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

const lookup = (node: SyntaxNode, context: Context) => {
  let scope = context;
  while (scope) {
    const val = scope.defns[node.value];
    if (val) {
      console.log('LOOKUP', node.value, val.type);
      return val;
    }
    scope = scope.parent;
  }

  return undefined;
}

const func = (node: SyntaxNode, context: Context, refNode: SyntaxNode) => {
  context; refNode;
  const funcName = node.children[0].value;
  const funcArgs = refNode.children.slice(1);
  console.log('EVAL FUNC', funcName, funcArgs);
}

export const evaluate = (program: SyntaxNode) => {
  const output = _eval(program, makeContext());
  console.log('>', output);
};


const _eval = (node: SyntaxNode, context: Context, refNode: SyntaxNode = null) => {
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
        default: {
          // Look up variable
          const found = lookup(node, context);
          if (!found) {
            fail(node, `Unknown identifier '${node.value}'`);
          }
          return _eval(found, context, node);
        }
      }

       /*
      let value;
      for (let child of node.children) {
        // Not right
        value = _eval(child, makeContext(context));
      }
      return value;
        */
    }
    case SyntaxNodeType.Function: {
      return func(node, makeContext(context), refNode);
    }
    case SyntaxNodeType.Program: {
      let value;
      for (let child of node.children) {
        value = _eval(child, context);
      }
      return value;
    }
  }
}

const fail = (node: SyntaxNode, message: string) => {
  node;
  throw new Error(`Error running program: ${message}`);
}

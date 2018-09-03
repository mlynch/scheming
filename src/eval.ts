import { SyntaxNode, SyntaxNodeType } from './parse';

//
// Evaluating - executing a program represented by an Abstract Syntax Tree
//

interface Context {
  defns: { [key:string]: SyntaxNode };
  parent: Context;
}

// Built-in functions our interpreter understands (such as arithmetic)
const builtins = {
  '*': (node: SyntaxNode, context: Context) => {
    const values = node.children.map(n => _eval(n, context));
    return values.reduce((values, value) => {
      return value * values;
    }, 1);
  },
  '/': (node: SyntaxNode, context: Context) => {
    const values = node.children.map(n => _eval(n, context));
    return values.reduce((values, value, index) => {
      if (index == 0) {
        return value;
      }
      return values / value;
    }, 0);
  },
  '+': (node: SyntaxNode, context: Context) => {
    const values = node.children.map(n => _eval(n, context));
    return values.reduce((values, value) => {
      return value + values;
    }, 0);
  },
  '-': (node: SyntaxNode, context: Context) => {
    let s = 0;
    for (let i = 0; i < node.children.length; i++) {
      const n = node.children[i];
      const value = _eval(n, context);
      s = s - value;
    }
    return s;
  }
}

const makeContext = (parent: Context = null, defns = {}) : Context => {
  return {
    defns,
    parent
  }
}

// Store a variable in the given context
const assign = (tree: SyntaxNode, context: Context) => {
  const a = (name, node: SyntaxNode) => {
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

// Lookup a variable in the closest context
const lookup = (node: SyntaxNode, context: Context) => {
  let scope = context;
  while (scope) {
    const val = scope.defns[node.value];
    if (val) {
      return val;
    }
    scope = scope.parent;
  }

  return undefined;
}

// Evaluate a function.
// First, build up the new context with the mapped parameters to the values
// returned from evaluating each function argument.
// Then, evaluate the function body using the new context
const func = (node: SyntaxNode, context: Context, refNode: SyntaxNode) => {
  context; refNode;
  //const funcName = node.children[0].value;
  const funcParams = node.children[0].children;
  const funcBody = node.children[1];
  const funcArgs = refNode.children.slice(1).map((arg, i) => {
    return {
      [funcParams[i].value]: _eval(arg, context)
    }
  }).reduce((args, arg) => {
    const key = Object.keys(arg)[0];
    args[key] = arg[key];
    return args;
  }, {});
  const newContext = makeContext(context, funcArgs);

  return _eval(funcBody, newContext);
}

// Call a function
const funcCall = (node: SyntaxNode, context: Context) => {
  const fn = builtins[node.value];
  const value = fn(node, context);
  return value;
}

// Call a function
const operatorCall = (node: SyntaxNode, context: Context) => {
  const fn = builtins[node.value];
  const value = fn(node, context);
  return value;
}

// Evaluate a program given by the root node of the AST
export const evaluate = (program: SyntaxNode) => {
  const output = _eval(program, makeContext());
  console.log('>', output);
};


const _eval = (node: SyntaxNode, context: Context, refNode: SyntaxNode = null) => {
  switch (node.type) {
    case SyntaxNodeType.Constant:
      return parseFloat(node.value);
    case SyntaxNodeType.Identifier:
      return lookup(node, context);
    case SyntaxNodeType.Definition:
      return assign(node, context);
    case SyntaxNodeType.Expression: {
      switch (node.value) {
        case 'define':
          return assign(node, context);
        /*
        default: {
          // Look up variable
          const found = lookup(node, context);
          if (!found) {
            fail(node, `Unknown identifier '${node.value}'`);
          }
          return _eval(found, context, node);
        }
        */
      }
      let value;
      for (let child of node.children) {
        value = _eval(child, context);
      }
      return value;
    }
    case SyntaxNodeType.Function: {
      return func(node, makeContext(context), refNode);
    }
    case SyntaxNodeType.FunctionCall: {
      return funcCall(node, makeContext(context));
    }
    case SyntaxNodeType.Operator: {
      return operatorCall(node, makeContext(context));
    }
    case SyntaxNodeType.FunctionBody:
    case SyntaxNodeType.Program: {
      let value;
      for (let child of node.children) {
        value = _eval(child, context);
      }
      return value;
    }
  }
}

  /*
const fail = (node: SyntaxNode, message: string) => {
  node;
  throw new Error(`Error running program: ${message}`);
}
   */

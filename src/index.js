var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const fs = require('fs'), util = require('util');
const readFile = util.promisify(fs.readFile);
var TokenType;
(function (TokenType) {
    TokenType["Unknown"] = "UNKNOWN";
    TokenType["Null"] = "NULL";
    TokenType["ParenOpen"] = "PAREN_OPEN";
    TokenType["ParenClose"] = "PAREN_CLOSE";
    TokenType["Whitespace"] = "WHITESPACE";
    TokenType["Operator"] = "OPERATOR";
    TokenType["Number"] = "NUMBER";
    TokenType["Letter"] = "LETTER";
})(TokenType || (TokenType = {}));
var SyntaxNodeType;
(function (SyntaxNodeType) {
    SyntaxNodeType["Program"] = "PROGRAM";
    SyntaxNodeType["Expression"] = "EXPRESSION";
    SyntaxNodeType["Definition"] = "DEFINTION";
    SyntaxNodeType["Number"] = "NUMBER";
    SyntaxNodeType["String"] = "STRING";
    SyntaxNodeType["Reference"] = "REFERENCE";
    SyntaxNodeType["Function"] = "FUNCTION";
    SyntaxNodeType["FunctionDeclaration"] = "FUNCTION_DECLARATION";
})(SyntaxNodeType || (SyntaxNodeType = {}));
const NoTokenTypeMatch = [0, { type: TokenType.Null }];
const isWhitespace = (c) => {
    return [' ', '\t', '\n', '\r'].indexOf(c) >= 0;
};
const isOperator = (c) => {
    return ['*', '/', '+', '-'].indexOf(c) >= 0;
};
const isNumber = (c) => {
    return !isNaN(parseFloat(c));
};
const isReference = (c) => {
    return /\w+/.test(c);
};
const isLetter = (c) => {
    return c.toLowerCase() !== c.toUpperCase();
};
const advance = (newTokenType, char, index, amount) => {
    return [index + amount, {
            type: newTokenType,
            position: index,
            value: char
        }];
};
//
// Tokenizing - reading a source file and building a stream of tokens to be parsed
//
const tokenizers = [
    (i, c) => c === '(' ? advance(TokenType.ParenOpen, c, i, 1) : NoTokenTypeMatch,
    (i, c) => c === ')' ? advance(TokenType.ParenClose, c, i, 1) : NoTokenTypeMatch,
    (i, c) => isWhitespace(c) ? advance(TokenType.Whitespace, c, i, 1) : NoTokenTypeMatch,
    (i, c) => isOperator(c) ? advance(TokenType.Operator, c, i, 1) : NoTokenTypeMatch,
    (i, c) => isLetter(c) ? advance(TokenType.Letter, c, i, 1) : NoTokenTypeMatch,
    (i, c) => isNumber(c) ? advance(TokenType.Number, c, i, 1) : NoTokenTypeMatch,
    (i, c) => advance(TokenType.Unknown, c, i, 1)
];
// Convert a program string into a stream of tokens
const tokenize = (program) => {
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
};
//
// Parsing - parsing a stream of tokens and building an Abstract Syntax Tree
//
const parse = (tokens) => {
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
    };
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
                }
                else {
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
                }
                else if (isNumber(c.value)) {
                    node = makeNode(SyntaxNodeType.Number, c, c.value);
                }
                else if (isReference(c.value)) {
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
const makeNode = (type, parent = null, value = '') => {
    console.log('Making node', type, value);
    return {
        type,
        value,
        children: [],
        parent
    };
};
const concatNodeValue = (node, value) => {
    return Object.assign({}, node, { value: "" + node.value + value });
};
const addChildToNode = (node, child) => {
    return Object.assign({}, node, { children: [...node.children, child] });
};
const isDefineExpr = (node) => {
    return node.value === 'define';
};
const peek = (stack) => stack[stack.length - 1];
const printAST = (tree, depth = 0) => {
    console.log(Array(depth).fill(' ').join(''), tree.type, tree.value);
    for (let node of tree.children) {
        printAST(node, depth + 1);
    }
};
//
// Evaluating - executing a program represented by an Abstract Syntax Tree
//
const evaluate = (_program) => {
};
const load = (path) => __awaiter(this, void 0, void 0, function* () {
    const fileContents = yield readFile(path, 'utf8');
    return fileContents;
});
const run = () => __awaiter(this, void 0, void 0, function* () {
    if (process.argv.length < 3) {
        console.error('Usage: scheming [file]');
        process.exit(1);
        return;
    }
    const arg = process.argv[2];
    try {
        evaluate(parse(tokenize(yield load(arg))));
    }
    catch (e) {
        console.error('Unable to run program', e);
    }
});
run();

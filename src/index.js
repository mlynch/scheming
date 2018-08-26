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
var SymbolType;
(function (SymbolType) {
    SymbolType["Function"] = "FUNCTION";
    SymbolType["FunctionDeclaration"] = "FUNCTION_DECLARATION";
})(SymbolType || (SymbolType = {}));
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
const interp = (_program) => {
};
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
const parse = (tokens) => {
    // let token = tokens[0];
    /*
    while (token) {
    }
     */
    tokens.forEach((t) => process.stdout.write(t.value));
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
        interp(parse(tokenize(yield load(arg))));
    }
    catch (e) {
        console.error('Unable to run program', e);
    }
});
run();

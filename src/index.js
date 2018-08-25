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
var Token;
(function (Token) {
    Token["Unknown"] = "UNKNOWN";
    Token["Null"] = "NULL";
    Token["ParenOpen"] = "PAREN_OPEN";
    Token["ParenClose"] = "PAREN_CLOSE";
    Token["Whitespace"] = "WHITESPACE";
    Token["Operator"] = "OPERATOR";
    Token["Number"] = "NUMBER";
    Token["Letter"] = "LETTER";
})(Token || (Token = {}));
var SymbolType;
(function (SymbolType) {
    SymbolType["Function"] = "FUNCTION";
    SymbolType["FunctionDeclaration"] = "FUNCTION_DECLARATION";
})(SymbolType || (SymbolType = {}));
const NoTokenMatch = [0, Token.Null];
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
const advance = (newToken, index, amount) => {
    return [index + amount, newToken];
};
const interp = (_program) => {
};
const tokenizers = [
    (i, c) => c === '(' ? advance(Token.ParenOpen, i, 1) : NoTokenMatch,
    (i, c) => c === ')' ? advance(Token.ParenClose, i, 1) : NoTokenMatch,
    (i, c) => isWhitespace(c) ? advance(Token.Whitespace, i, 1) : NoTokenMatch,
    (i, c) => isOperator(c) ? advance(Token.Operator, i, 1) : NoTokenMatch,
    (i, c) => isLetter(c) ? advance(Token.Letter, i, 1) : NoTokenMatch,
    (i, c) => isNumber(c) ? advance(Token.Number, i, 1) : NoTokenMatch,
    (i, _c) => advance(Token.Unknown, i, 1)
];
// Convert a program string into a stream of tokens
const tokenize = (program) => {
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
};
const parse = (tokens) => {
    console.log('Parsing tokens');
    tokens.forEach((t) => process.stdout.write(t));
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

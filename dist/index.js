(function () {
    'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    function __awaiter(thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    //
    // Tokenizing - reading a source file and building a stream of tokens to be parsed
    //
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
    const isIdentifier = (c) => {
        return /[\w\-]+/.test(c);
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
    var SyntaxNodeType;
    (function (SyntaxNodeType) {
        SyntaxNodeType["Program"] = "PROGRAM";
        SyntaxNodeType["Constant"] = "CONSTANT";
        SyntaxNodeType["Expression"] = "EXPRESSION";
        SyntaxNodeType["String"] = "STRING";
        SyntaxNodeType["Identifier"] = "IDENTIFIER";
        SyntaxNodeType["Function"] = "FUNCTION";
        SyntaxNodeType["FunctionName"] = "FUNCTION_NAME";
        SyntaxNodeType["FunctionParameter"] = "FUNCTION_PARAMETER";
        SyntaxNodeType["FunctionBody"] = "FUNCTION_BODY";
        SyntaxNodeType["Definition"] = "DEFINITION";
        SyntaxNodeType["FunctionCall"] = "FUNCTION_CALL";
        SyntaxNodeType["FunctionArgument"] = "FUNCTION_ARGUMENT";
    })(SyntaxNodeType || (SyntaxNodeType = {}));
    const makeNode = (type, parent = null, value = '') => {
        console.log('Making node', type, value);
        const newNode = {
            type,
            value,
            children: [],
            parent
        };
        parent && parent.children.push(newNode);
        return newNode;
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
                            }
                            else if (token.type === TokenType.Number) {
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
                            if (isDefineExpr(c)) ;
                            else if (isNumber(c.value)) {
                                node = makeNode(SyntaxNodeType.Constant, c, c.value);
                            }
                            else if (isIdentifier(c.value)) {
                                node = makeNode(SyntaxNodeType.Identifier, c, c.value);
                                stack.push(node);
                                stack.pop();
                            }
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

    const makeContext = (parent = null) => {
        return {
            defns: {},
            parent
        };
    };
    const assign = (tree, context) => {
        const a = (name, node) => {
            console.log('ASSIGN', name, node.type);
            context.defns[name] = node;
        };
        const first = tree.children[0];
        switch (first.type) {
            case SyntaxNodeType.Function: {
                const name = first.children[0].value;
                a(name, first);
                break;
            }
        }
        return tree;
    };
    const evaluate = (program) => {
        const output = _eval(program, makeContext());
        console.log('>', output);
    };
    const _eval = (node, context) => {
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
            case SyntaxNodeType.Function:
            case SyntaxNodeType.Program: {
                let value;
                for (let child of node.children) {
                    value = _eval(child, makeContext(context));
                }
                return value;
            }
        }
    };

    const fs = require('fs'), util = require('util');
    const readFile = util.promisify(fs.readFile);
    const load = (path) => __awaiter(undefined, void 0, void 0, function* () {
        const fileContents = yield readFile(path, 'utf8');
        return fileContents;
    });
    const run = () => __awaiter(undefined, void 0, void 0, function* () {
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

}());

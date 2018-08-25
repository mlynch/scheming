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
var State;
(function (State) {
    State[State["Null"] = 0] = "Null";
    State[State["ParenOpen"] = 1] = "ParenOpen";
    State[State["ParenClose"] = 2] = "ParenClose";
    State[State["Operator"] = 4] = "Operator";
    State[State["Number"] = 5] = "Number";
    State[State["Letter"] = 6] = "Letter";
})(State || (State = {}));
const isOperator = (c) => {
    return ['*', 'x', '+', '-'].indexOf(c) >= 0;
};
const isNumber = (c) => {
    return !isNaN(parseFloat(c));
};
const isLetter = (c) => {
    return c.toLowerCase() !== c.toUpperCase();
};
const advance = (newState, index, amount) => {
    return [index + amount, newState];
};
const interp = (_program) => {
};
const consumers = [
    (i, c) => c === '(' ? advance(State.ParenOpen, i, 1) : null,
    (i, c) => c === ')' ? advance(State.ParenClose, i, 1) : null,
    (i, c) => isOperator(c) ? advance(State.Operator, i, 1) : null,
    (i, c) => isLetter(c) ? advance(State.Letter, i, 1) : null,
    (i, c) => isNumber(c) ? advance(State.Number, i, 1) : null
];
const consume = ([i, newState, oldState]) => {
    if (newState != oldState) {
        // console.log('State change', i, `${oldState} -> ${newState}`);
    }
    return [i, newState];
};
const parse = (program) => {
    // let len = program.length;
    let i = 0;
    let c = program[0];
    let ast = {};
    // let sym = null;
    let state = State.Null;
    // console.log(c);
    while (c) {
        let result;
        process.stdout.write(c);
        // console.log(i);
        for (let op of consumers) {
            result = op(i, c);
            if (result) {
                [i, state] = consume([...result, state]);
                break;
            }
        }
        if (!result) {
            i++;
        }
        // console.log('Avanced to', i);
        c = program[i];
    }
    process.stdout.write('\n');
    return ast;
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
        interp(parse(yield load(arg)));
    }
    catch (e) {
        console.error('Unable to run program', e);
    }
});
run();

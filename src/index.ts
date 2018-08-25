const fs = require('fs'),
      util = require('util');

const readFile = util.promisify(fs.readFile);


enum State {
  Null = 0,
  ParenOpen = 1,
  ParenClose = 2,
  Operator = 4,
  Number = 5,
  Letter = 6
}

const isOperator = (c: string) => {
  return ['*', 'x', '+', '-'].indexOf(c) >= 0;
}

const isNumber = (c: string) => {
  return !isNaN(parseFloat(c));
}

const isLetter = (c: string) => {
  return c.toLowerCase() !== c.toUpperCase();
}

const advance = (newState: State, index: number, amount: number) => {
  return [index + amount, newState];
}

const interp = (_program: any) => {
};

const consumers = [
  (i, c) => c === '('     ? advance(State.ParenOpen, i, 1) : null,
  (i, c) => c === ')'     ? advance(State.ParenClose, i, 1) : null,
  (i, c) => isOperator(c) ? advance(State.Operator, i, 1) : null,
  (i, c) => isLetter(c) ? advance(State.Letter, i, 1) : null,
  (i, c) => isNumber(c) ? advance(State.Number, i, 1) : null
]

const consume = ([i, newState, oldState]: [number, number, number]) => {
  if (newState != oldState) {
    // console.log('State change', i, `${oldState} -> ${newState}`);
  }

  return [i, newState];
}


const parse = (program: string) => {
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
        [i, state] = consume([...result, state] as [number, number, number]);
        break;
      }
    }

    if (!result) {
      i++;
    }

    c = program[i];
  }
  process.stdout.write('\n');

  return ast;
}

const load = async (path: string) => {
  const fileContents = await readFile(path, 'utf8');
  return fileContents;
}

const run = async () => {
  if (process.argv.length < 3) {
    console.error('Usage: scheming [file]');
    process.exit(1);
    return;
  }
  const arg = process.argv[2];
  try {
    interp(parse(await load(arg)));
  } catch(e) {
    console.error('Unable to run program', e);
  }
}

run();

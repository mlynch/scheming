const fs = require('fs'),
      util = require('util');

const readFile = util.promisify(fs.readFile);

import { tokenize } from './tokenize';
import { parse } from './parse';
import { evaluate } from './eval';

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
    evaluate(parse(tokenize(await load(arg))));
  } catch(e) {
    console.error('Unable to run program', e);
  }
}

run();

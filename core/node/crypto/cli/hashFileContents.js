import { colors } from 'dmt/common';

import fs from 'fs';

import tools from '../tools.js';
const { fileHash } = tools;

const args = process.argv.slice(2);

if (args.length != 1) {
  console.log(colors.red('Wrong number of arguments'));
  process.exit();
}

const filePath = args[0];

if (!fs.existsSync(filePath)) {
  console.log(colors.red("File doesn't exist"));
  process.exit();
}

fileHash(filePath).then(hash => {
  console.log(colors.gray(`Hash of the file: ${colors.green(hash)}`));
});

import colors from 'colors';
import fs from 'fs';

import dmt from 'dmt-bridge';
const { util, cli } = dmt;

import ffprobe from '../lib/metadataReader/ffprobe';

function help() {
  console.log(colors.yellow('Usage:'));
  console.log(`${colors.green('readMetadata')} ${colors.gray('[file]')}`);
}

if (process.argv.length <= 2 || process.argv[2] == '-h') {
  help();
  process.exit();
}

const filePath = process.argv[2];

if (!fs.existsSync(filePath)) {
  console.log(`⚠️  Error: file ${colors.red(filePath)} doesn't exist`);
  process.exit();
}

ffprobe({ filePath })
  .then(metadata => {
    console.log(colors.green('Metadata:'));
    console.log(metadata);
  })
  .catch(e => {
    console.log(colors.red('Error'));
  });

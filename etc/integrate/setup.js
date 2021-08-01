import fs from 'fs';
import nodeReadline from 'readline';

import { join } from 'path';

import colors from './colors.js';
import { execSync } from 'child_process';

const readline = nodeReadline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const input = (question) => {
  return new Promise((accept, reject) => {
    try {
      readline.question(question, value => accept(value))
    } catch (error) {
      reject(error);
    }
  })
}

// let appBase = '';
let settings = '';
let dmtBashDefault = '#!/bin/bash\n';
let packageJson;

const getQuestion = (question, _default, comment) => `${colors.blue(question)}\n${colors.dim(comment)}\n: ${colors.dim('(' + _default + ')')} `;

const settingQuestions = [['base name?', 'your-app-base', 'where the app will be mounted on the url path, for example: localhost:7777/dmt-search'],
['build directory?', 'build', 'directory with frontend result which is synced into `~/.dmt/user/apps` (user) or `~/.dmt-here/apps` (device)'],
['target app type?', 'user', 'device or user']]

for (let question of settingQuestions) {
  try {
    const value = (await input(getQuestion(...question))).trim() || question[1];
    if (!value) continue;
    const key = question[0].split(' ')[0].trim();
    const comment = question[2];
    settings += `${key}:  ${value}  #${comment}\n`;
    // if (key == 'base') {
    //   appBase = value;
    // }
  } catch (error) {
    console.log(colors.red(error));
  }
};

{
  const packageNeeded = (await input(colors.blue('Generate package.json:') + colors.dim(' (y for yes, any other for no) '))).trim();
  if (packageNeeded == 'y') {
    packageJson = JSON.stringify({
      "name": 'dmt',
      "type": "module",
      "exports": {
        "./common": "./_dmt_deps/common/index.js",
        "./notify": "./_dmt_deps/notify/index.js",
        "./search": "./_dmt_deps/search/index.js",
        "./connectome": "./_dmt_deps/connectome/index.js",
        "./connectome-stores": "./_dmt_deps/connectome-stores/index.js"
      },
      "dependencies": {

      }
    }, null, 4)
  }
}


readline.close();

const projectRoot = process.argv[2] || '';

if (!fs.existsSync(join(projectRoot, 'dmt-install'))) {
  fs.mkdirSync(join(projectRoot, 'dmt-install'));
}

fs.writeFileSync(join(projectRoot, 'dmt-install/settings.def'), settings);

for (const script of ['before-install', 'after-install']) {
  fs.writeFileSync(join(projectRoot, 'dmt-install/' + script), dmtBashDefault);
  try {
    execSync('chmod +x ' + join(projectRoot, 'dmt-install/' + script))
  } catch (error) {
    console.log(colors.red(error))
  }
}

if (packageJson) {
  fs.writeFileSync(join(projectRoot, 'dmt-install/package.json'), packageJson);
  console.log(colors.cyan('Add server-side/backend dependancies to dmt-install/package.json'))
}

console.log(colors.green('initialized dmt install'));
const fs = require('fs');
const { def2json } = require('..');

const def = fs.readFileSync('example/example.def', 'utf-8');

console.log(JSON.stringify(def2json(def), undefined, 2));

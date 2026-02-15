const fs = require('fs');
const { json2def } = require('..');

const json = JSON.parse(fs.readFileSync('example/example.json', 'utf-8'));

console.log(json2def(json));

import Table from '../index.js';

var table = new Table();

table.push({ '🔑 Some key': 'Some value' }, { 'Another key': 'Another value' });

console.log(table.toString());

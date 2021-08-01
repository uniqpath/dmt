import Table from '../index.js';

const table = new Table();

const headers = ['country', 'code'];

table.push(headers);
table.push(Table.divider);

table.push(['United States of America', 'USA']);
table.push(['China', 'CH']);
table.push(['Russia', 'RU']);

table.push(Table.divider);

table.push(['Germany', 'DE']);
table.push(['France', 'FR']);
table.push(['United Kingdom', 'UK']);

table.push(Table.divider);

table.push(['Argentina', 'AR']);
table.push(['Mexico', 'MX']);

console.log(table.toString());

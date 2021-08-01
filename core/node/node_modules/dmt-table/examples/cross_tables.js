import Table from '../index.js';

var table = new Table({ head: ['', 'Top Header 1', 'Top Header 2'] });

table.push(
  {
    'Left Header 1': [
      ['Value Row 1 Col 1', 'Value Row 1 Col 2'],
      ['Value Row 1 Col 1', 'Value Row 1 Col 2']
    ]
  },
  { 'Left Header 2': ['Value Row 2 Col 1', 'Value Row 2 Col 2'] }
);

console.log(table.toString());

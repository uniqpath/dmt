# dmtsys table 

### (nodejs, cli)

A simple and modern `node.js` library for nice tables in all modern computer terminals 💻

## How to create a basic table?

```js

import Table from 'dmt-table';

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
```

** Output: **

```
┌──────────────────────────┬──────┐
│ country                  │ code │
├──────────────────────────┼──────┤
│ United States of America │ USA  │
│ China                    │ CH   │
│ Russia                   │ RU   │
├──────────────────────────┼──────┤
│ Germany                  │ DE   │
│ France                   │ FR   │
│ United Kingdom           │ UK   │
├──────────────────────────┼──────┤
│ Argentina                │ AR   │
│ Mexico                   │ MX   │
└──────────────────────────┴──────┘
```

See `./examples` folder for more runnable examples.

## For fancier tables please use another library

💡 Recommended: [table](https://github.com/gajus/table) JS library.

See an example output at [hodlings cli project](https://github.com/davidhq/hodlings) which uses `table`.

With this great library you can specify separate column styles and many more. No sure if it can do simple **dividers**.

`dmt-table` is for really basic tables and it also supports dividers.

## Based on

🙏 [cli-table2](https://github.com/jamestalmage/cli-table2) which is based on 🙏 [cli-table](https://github.com/Automattic/cli-table)

This library `dmt-table` is a rewrite of `cli-table2` to modern ES6 JavaScript with added new features like easy to use **table dividers** (horizontal line between table sections).

This library has no tests because they are the same as in cli-table2 and nothing critical was changed. Maybe tests will be added here in the future on further feature developments.

# 🆕 Dividers:

```js
table.push(Table.divider);
````

## How it's implemented

Very elegantly! Thank you for asking. A precision hack was used.

These three steps are the gist of the hack:

Divider class:
```js
class Divider {}

export default Divider;
````

Expose it directly through `Table` class:
```js
Object.defineProperty(Table, 'divider', { value: new Divider() });
```

Split **Divider row** into the correct number of **Divider cells**:
```js
function generateCells(rows) {
  //…

  if (row instanceof Divider) {
    const numCells = rows[0].length;

    // Create an array with same element repeated multiple times:
    // https://stackoverflow.com/a/34104348/458177
    return Array(numCells)
      .fill(new Divider())
      .map(cell => {
        return new Cell(cell);
      });
  }

  //…
}
```

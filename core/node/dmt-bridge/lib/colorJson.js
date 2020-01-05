const colorer = require('colors');

const defaultColors = {
  separator: 'gray',
  string: 'green',
  number: 'magenta',
  boolean: 'cyan',
  null: 'gray',
  key: 'green'
};

function syntaxHighlight(json, colors = defaultColors) {
  if (typeof json != 'string') {
    json = JSON.stringify(json, null, 2);
  } else {
    json = JSON.stringify(JSON.parse(json), null, 2);
  }

  return colorer[colors.separator](
    json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, match => {
      let colorCode = 'number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) colorCode = 'key';
        else colorCode = 'string';
      } else if (/true|false/.test(match)) {
        colorCode = 'boolean';
      } else if (/null/.test(match)) {
        colorCode = 'null';
      }

      const color = colors[colorCode];

      return `${colorer[color](match)}`;
    })
  );
}

module.exports = syntaxHighlight;

if (require.main === module) {
  console.log(syntaxHighlight({ a: 1, b: 2, c: 'lala', d: null, e: true }));
}

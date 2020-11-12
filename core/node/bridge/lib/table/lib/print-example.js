var chai = require('chai');
var expect = chai.expect;
var colors = require('colors/safe');
var fs = require('fs');
var git = require('git-rev');

function logExample(fn) {
  runPrintingExample(
    fn,
    function logName(name) {
      console.log(colors.gray('=========  ') + name + colors.gray('  ================'));
    },
    console.log,
    console.log,
    console.log,
    identity
  );
}

function mdExample(fn, file, cb) {
  git.long(function(commitHash) {
    var buffer = [];

    runPrintingExample(
      fn,
      function logName(name) {
        buffer.push('##### ' + name);
      },
      function logTable(table) {
        table = stripColors(table);

        table = '    ' + table.split('\n').join('\n    ');

        buffer.push(table);
      },
      function logCode(code) {
        buffer.push('```javascript');
        buffer.push(stripColors(code));
        buffer.push('```');
      },
      function logSeparator(sep) {
        buffer.push(stripColors(sep));
      },
      function logScreenShot(image) {
        buffer.push('![table image](https://cdn.rawgit.com/jamestalmage/cli-table2/' + commitHash + '/examples/screenshots/' + image + '.png)');
      }
    );

    fs.writeFileSync(file, buffer.join('\n'));

    if (cb) {
      cb();
    }
  });
}

function runTest(name, fn) {
  function testExample(name, fn, expected) {
    it(name, function() {
      expect(fn().toString()).to.equal(expected.join('\n'));
    });
  }

  describe(name, function() {
    fn(testExample, identity);
  });
}

function runPrintingExample(fn, logName, logTable, logCode, logSeparator, logScreenShot) {
  function printExample(name, makeTable, expected, screenshot) {
    var code = makeTable
      .toString()
      .split('\n')
      .slice(1, -2)
      .join('\n');

    logName(name);
    if (screenshot && logScreenShot) {
      logScreenShot(screenshot);
    } else {
      logTable(makeTable().toString());
    }
    logCode(code);
    logSeparator('\n');
  }

  fn(printExample);
}

function stripColors(str) {
  return str.split(/\u001b\[(?:\d*;){0,5}\d*m/g).join('');
}

function identity(str) {
  return str;
}

module.exports = {
  mdExample: mdExample,
  logExample: logExample,
  runTest: runTest
};

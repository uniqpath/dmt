const colors = require('colors');

function resultsFormatter(results, resultMap = x => x) {
  results.forEach((result, index) => {
    process.stdout.write(`${colors.green(index + 1)}. `);
    console.log(resultMap(result));
  });
}

module.exports = resultsFormatter;

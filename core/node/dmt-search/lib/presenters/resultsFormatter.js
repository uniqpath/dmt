import colors from 'colors';

export default function resultsFormatter(results, resultMap = x => x) {
  results.forEach((result, index) => {
    process.stdout.write(`${colors.green(index + 1)}. `);
    console.log(resultMap(result));
  });
}

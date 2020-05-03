import colors from 'colors';

import resultsFormatter from './resultsFormatter';

function aggregateResultsFormatter(aggregateResults) {
  for (const providerResponse of aggregateResults) {
    const { meta } = providerResponse;

    const cnt = meta.contentId ? `${colors.gray('/')}${colors.cyan(meta.contentId)}` : '';

    console.log(
      `\n${colors.green('Content')} → ${colors.magenta(`@${meta.providerHost}`)}${cnt} ${
        providerResponse.providerAddress ? colors.gray(`(${meta.providerAddress})`) : ''
      } ${colors.yellow(meta && meta.fallbackMsg ? `● ${meta.fallbackMsg}` : '')}`
    );
    if (providerResponse.error) {
      console.log(colors.red(`⮑  ⚠️  Error: ${providerResponse.error}`));
    } else {
      resultsFormatter(providerResponse.results);
      const { page, noMorePages, resultCount, resultsFrom, resultsTo, searchTime, searchTimePretty, networkTime, networkTimePretty } = meta;

      let time = '';
      if (searchTime) {
        time += colors.gray(` ■ fs ${colors.green(searchTimePretty)}`);
      }

      if (networkTime) {
        time += colors.gray(` ■ network ${colors.cyan(networkTimePretty)}`);
      }

      if (resultCount > 0) {
        if (page == 1 && noMorePages) {
          console.log(colors.yellow(`${resultCount} ${resultCount == 1 ? 'result' : 'results'}${time}`));
        } else {
          const isLastPage = noMorePages ? colors.gray(' (last page)') : '';
          const resultsDescription = `${colors.cyan(`Results ${resultsFrom} to ${resultsTo}`)}`;
          console.log(colors.gray(`${colors.magenta(`Page ${page}`)}${isLastPage} → ${resultsDescription}${time}`));
        }
      } else {
        console.log(colors.gray(`No ${page > 1 ? 'more ' : ''}results${time}`));
      }
      console.log(colors.green('⮑  Success'));
    }
  }
}

export default aggregateResultsFormatter;

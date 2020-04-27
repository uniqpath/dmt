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
      const { totalCount, searchTime, searchTimePretty, networkTime, networkTimePretty } = meta;

      let time = '';
      if (searchTime) {
        time += colors.gray(` ■ ${colors.green(searchTimePretty)} fs`);
      }

      if (networkTime) {
        time += colors.gray(` ■ ${colors.cyan(networkTimePretty)} network`);
      }

      if (totalCount > 0) {
        let explain = '';
        if (totalCount == meta.maxResults) {
          explain = ' or more';
        }
        console.log(colors.gray(`All results → ${colors.yellow(`${totalCount}${explain}`)}${time}`));
      } else {
        console.log(colors.gray(`No results${time}`));
      }
      console.log(colors.green('⮑  Success'));
    }
  }
}

export default aggregateResultsFormatter;

import colors from 'colors';
import { errorFormatter } from 'dmt-rpc';

import resultsFormatter from './resultsFormatter';

function aggregateResultsFormatter(aggregateResults, resultMap) {
  if (aggregateResults.error) {
    errorFormatter(aggregateResults.error, { host: '' });
    return;
  }

  for (const providerResponse of aggregateResults) {
    const { meta } = providerResponse;

    const cnt = meta.contentId ? `${colors.gray('/')}${colors.cyan(meta.contentId)}` : '';

    console.log(
      `\n${colors.green('Provider')}: ${colors.magenta(`@${meta.providerHost}`)}${cnt} ${
        providerResponse.providerAddress ? colors.gray(`(${meta.providerAddress})`) : ''
      } ${colors.yellow(meta && meta.fallbackMsg ? `● ${meta.fallbackMsg}` : '')}`
    );
    if (providerResponse.error) {
      errorFormatter(providerResponse.error, { host: meta.providerHost });
    } else {
      resultsFormatter(providerResponse.results, resultMap);
      const { totalCount, searchTime } = meta;

      let time = '';
      if (searchTime) {
        time = colors.gray(` ■ ${colors.green(searchTime)}`);
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
    }
  }
}

export default aggregateResultsFormatter;

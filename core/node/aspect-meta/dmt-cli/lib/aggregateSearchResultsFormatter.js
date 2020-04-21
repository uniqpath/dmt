import colors from 'colors';
import resultsFormatter from './resultsFormatter';

function aggregateResultsFormatter(aggregateResults, resultMap) {
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
      resultsFormatter(providerResponse.results, resultMap);
      const { totalCount, searchTime, totalDuration } = meta;

      let time = '';
      if (searchTime) {
        const tag = meta.providerAddress == 'localhost' ? 'local' : 'remote';
        time += colors.gray(` ■ ${colors.green(searchTime)} (${tag} fs)`);
      }

      if (totalDuration) {
        time += colors.gray(` ■ ${colors.cyan(totalDuration)} (total roundtrip)`);
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

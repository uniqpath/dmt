import ipcClient from './lib/ipcClient';

import colorJSON from './lib/colorJSON';
import resultsFormatter from './lib/resultsFormatter';
import aggregateSearchResultsFormatter from './lib/aggregateSearchResultsFormatter';

function pad(number, digits = 2) {
  return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
}

export { ipcClient, resultsFormatter, aggregateSearchResultsFormatter, colorJSON, pad };

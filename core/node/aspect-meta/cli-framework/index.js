import Table from 'dmt-table';
import ipcClient from './lib/ipcClient.js';

import colorJSON from './lib/colorJSON.js';

import resultsFormatter from './lib/resultsFormatter.js';
import aggregateSearchResultsFormatter from './lib/aggregateSearchResultsFormatter.js';

import parseArgs from './lib/parseArgs.js';

function pad(number, digits = 2) {
  return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
}

export { ipcClient, resultsFormatter, aggregateSearchResultsFormatter, colorJSON, Table, parseArgs, pad };

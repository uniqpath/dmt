import dmt from 'dmt/bridge';
const { log, util } = dmt;

import colors from 'colors';
import { spawn } from 'child_process';

import stripAnsi from 'strip-ansi';

import pathModule from 'path';

export default function executableSearch(binary, { terms, path, noColor, mediaType, page = 1, maxResults }, processLineCallback) {
  if (!maxResults) {
    throw new Error('executableSearch: maxResults is undefined, must provide maxResults argument');
  }

  const constructedTerms = [];

  if (noColor) {
    constructedTerms.push('--no-color');
  }

  constructedTerms.push('--only-files');

  constructedTerms.push('--search-absolute-path');

  constructedTerms.push(...util.clone(terms));

  if (mediaType) {
    constructedTerms.push(`@media=${mediaType}`);
  }

  const cwd = path;

  log.debug(`Calling external binary ${cwd ? `${colors.cyan(`cd ${cwd}`)}; ` : ''}${colors.cyan(binary)} ${colors.yellow(constructedTerms.join(' '))}`);

  const ls = spawn(dmt.platformExecutablePath(binary), constructedTerms, {
    cwd
  });

  let resultsSoFar = 0;
  const initialResultsToIgnore = (page - 1) * maxResults;
  let finishedPrematurely = false;

  ls.stdout.on('data', data => {
    const lines = data
      .toString()
      .split('\n')
      .filter(line => {
        const filePath = stripAnsi(line);
        return (
          filePath.trim() != '' &&
          !filePath.endsWith('.DS_Store') &&
          !(pathModule.basename(filePath).startsWith('~$') && filePath.endsWith('.docx')) &&
          !filePath.endsWith('.swp') &&
          !filePath.endsWith('.zeta.txt') &&
          !filePath.endsWith('.zeta.json')
        );
      });

    if (resultsSoFar < page * maxResults) {
      const resultsToIgnore = Math.max(0, initialResultsToIgnore - resultsSoFar);
      processLineCallback(lines.slice(resultsToIgnore).slice(0, page * maxResults - resultsSoFar));
    } else if (!finishedPrematurely) {
      log.debug(`returned ${maxResults} results for terms ${JSON.stringify(constructedTerms)} on ${path}`);
      finishedPrematurely = true;
      processLineCallback(null);
      ls.kill();
    }

    resultsSoFar += lines.length;
  });

  ls.stderr.on('data', data => {
    console.log(`stderr: ${data}\n`);
  });

  ls.on('close', code => {
    if (!finishedPrematurely) {
      log.debug(`returned ${resultsSoFar} results for terms ${JSON.stringify(constructedTerms)} on ${path}`);
      processLineCallback(null);
    }
  });
}

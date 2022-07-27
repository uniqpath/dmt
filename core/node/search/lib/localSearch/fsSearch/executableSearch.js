import { log, util, colors, platformExecutablePath } from 'dmt/common';

import { spawn } from 'child_process';

import stripAnsi from 'strip-ansi';

import pathModule from 'path';

import allowFSResult from './allowFSResult.js';
import zetaDirPath from './dotZeta/zetaDirPath.js';

export default function executableSearch(binary, { terms, path, noColor, mediaType, page = 1, maxResults, accessKey }, processLineCallback) {
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

  log.write(`Calling external binary ${cwd ? `${colors.cyan(`cd ${cwd}`)}; ` : ''}${colors.cyan(binary)} ${colors.yellow(constructedTerms.join(' '))}`);

  const ls = spawn(platformExecutablePath(binary), constructedTerms, {
    cwd
  });

  let resultsSoFar = 0;
  const initialResultsToIgnore = (page - 1) * maxResults;
  let finishedPrematurely = false;

  ls.stdout.on('data', data => {
    const linesFirstPass = data
      .toString()
      .split('\n')
      .filter(line => {
        const filePath = stripAnsi(line);
        return allowFSResult(filePath);
      });

    const lines = linesFirstPass;

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

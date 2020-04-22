import dmt from 'dmt-bridge';
const { log, util } = dmt;

import colors from 'colors';
import { spawn } from 'child_process';

export default function searchWithOSBinary(binary, { terms, path, noColor, mediaType, maxResults }, processLineCallback) {
  if (!maxResults) {
    throw new Error('searchWithOSBinary: maxResults is undefined, must provide maxResults argument');
  }

  const constructedTerms = [];

  if (noColor) {
    constructedTerms.push('--no-color');
  }

  constructedTerms.push('--only-files');

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
  let finishedPrematurely = false;

  ls.stdout.on('data', data => {
    const lines = data
      .toString()
      .split('\n')
      .filter(line => line.trim() != '');

    if (resultsSoFar < maxResults) {
      processLineCallback(lines.slice(0, maxResults - resultsSoFar));
    } else if (!finishedPrematurely) {
      log.debug(`returned ${maxResults} results for terms ${JSON.stringify(constructedTerms)} on ${path}`);
      finishedPrematurely = true;
      processLineCallback(null);
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

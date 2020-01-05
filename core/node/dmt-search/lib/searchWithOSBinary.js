const dmt = require('dmt-bridge');
const { log } = dmt;

const colors = require('colors');
const { spawn } = require('child_process');

function searchWithOSBinary(binary, { terms, path, noColor, mediaType, maxResults }, processLineCallback) {
  if (!maxResults) {
    throw new Error('searchWithOSBinary: maxResults is undefined, must provide maxResults argument');
  }

  const constructedTerms = terms;

  if (noColor) {
    constructedTerms.push('--no-color');
  }

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

module.exports = searchWithOSBinary;

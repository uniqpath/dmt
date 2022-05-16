import fs from 'fs';

import { settings, detectMediaType } from 'dmt/search';

import { prettyFileSize, prettyTimeAge, log } from 'dmt/common';

import pathModule from 'path';

import stripAnsi from 'strip-ansi';

import executableSearch from './executableSearch';

function multipathSearch({ contentPaths, terms, page, maxResults, mediaType }) {
  return new Promise((success, reject) => {
    const promises = contentPaths
      .filter(path => fs.existsSync(path))
      .map(path => {
        return searchOnePath({ path, terms, page, maxResults, mediaType });
      });

    Promise.all(promises)
      .then(allResultsAndErrors => {
        const results = allResultsAndErrors.flat().slice(0, maxResults);

        success(results);
      })
      .catch(e => {
        log.red(`Promise.all error: ${e}`);
      });
  });
}

function searchOnePath({ path, terms, page, maxResults, mediaType }) {
  return new Promise((success, reject) => {
    const results = [];

    executableSearch(settings().searchBinary, { path, terms, page, maxResults, mediaType }, resultBatch => {
      if (resultBatch) {
        if (resultBatch.error) {
          success({ error: resultBatch.error });
          return;
        }

        resultBatch = resultBatch
          .map(filePathANSI => {
            const filePath = stripAnsi(filePathANSI);

            const { size: fileSize, mtime } = fs.statSync(filePath);

            const fileName = pathModule.basename(filePath);
            const directory = pathModule.dirname(filePath);
            const mediaType = detectMediaType(fileName);

            const data = {
              filePath,
              filePathANSI,
              fileSize,
              fileSizePretty: prettyFileSize(fileSize),
              fileUpdatedAt: mtime,
              fileUpdatedAtRelativePretty: prettyTimeAge(mtime),
              fileName,
              directory,
              mediaType,
              resultType: 'fs'
            };

            const filePathWithoutExtension = filePath.slice(0, filePath.length - pathModule.extname(filePath).length);
            const noteFilePath = `${filePathWithoutExtension}.zeta.txt`;

            if (fs.existsSync(noteFilePath)) {
              const fileNote = fs.readFileSync(noteFilePath).toString();
              Object.assign(data, { fileNote });
            }

            const fileJsonMetadataPath = `${filePathWithoutExtension}.zeta.json`;

            if (fs.existsSync(fileJsonMetadataPath)) {
              const fileMetadata = JSON.parse(fs.readFileSync(fileJsonMetadataPath).toString());
              Object.assign(data, fileMetadata);
              if (data.swarmBeeHash) {
                data.swarmUrl = `https://gateway.ethswarm.org/files/${data.swarmBeeHash}`;
              }
            }

            return data;
          })
          .filter(Boolean);

        results.push(...resultBatch);
      } else {
        success(results);
      }
    });
  });
}

export default multipathSearch;

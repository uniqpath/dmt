import fs from 'fs';

import dmt from 'dmt/common';

const { scan } = dmt;

import parseLinksTxtFile from './parseLinksTxtFile';
import getAllTxtFiles from './getAllTxtFiles';
import normalizeUrls from './normalizeUrls';
import deduplicate from './deduplicate';

function splitToLines(buffer) {
  return buffer
    .toString()
    .split('\r')
    .join('')
    .split('\n');
}

export default function ingestLinks(directory) {
  return new Promise((success, reject) => {
    if (fs.existsSync(directory)) {
      const files = getAllTxtFiles(directory);

      scan.readFiles(files).then(results => {
        const urls = results
          .map(({ filePath, fileBuffer, error }) => {
            if (error) {
              console.log(`Problem scanning text file: ${filePath}`);
            } else {
              const lines = splitToLines(fileBuffer);
              return parseLinksTxtFile({ filePath, lines });
            }
          })
          .filter(Boolean)
          .flat();

        success(deduplicate(normalizeUrls(urls)));
      });
    } else {
      success([]);
    }
  });
}

import fs from 'fs';

const IGNORED = ['--unused', '--disabled', '--ignore', '--ignored'];

import { scan } from 'dmt/common';

import parseLinksTxtFile from './parseLinksTxtFile.js';
import getAllTxtFiles from './getAllTxtFiles.js';
import normalizeUrls from './normalizeUrls.js';
import deduplicate from './deduplicate.js';

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
          .filter(({ filePath }) => !IGNORED.some(keyword => filePath.match(new RegExp(`${keyword}(?!\\w)`))))
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

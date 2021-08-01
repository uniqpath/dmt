import { textfileParsers } from 'dmt/common';
const { textfileKeyValueParser } = textfileParsers;

import parseDuration from './parseDurationHelper.js';

function fixYear(id3Data) {
  if (id3Data.year && id3Data.year.length != 4) {
    const match = id3Data.year.match(/\d\d\d\d/);
    if (match) {
      id3Data.year = match;
    }
  }
}

export default function parseOutput(output) {
  const result = { duration: parseDuration(output) };

  let metadata = '';

  const re = new RegExp(/Metadata:(.*?)$/s);

  const matches = output.match(re);

  if (matches) {
    metadata = matches[1];

    const keys = ['track', 'album', 'artist', 'title', 'date', 'genre'];
    const keyMap = { date: 'year' };

    const id3Data = textfileKeyValueParser({ content: metadata, keys, keyMap, delimiter: ':', caseInsensitive: true });

    fixYear(id3Data);

    return { ...id3Data, ...result };
  }

  return result;
}

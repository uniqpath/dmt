import util from '../../util';

import { getLines } from './helpers';

function valueForKey({ lines, key, delimiter, caseInsensitive }) {
  const re = new RegExp(`^${key}\\s*${delimiter}\\s*(.*?)$`, caseInsensitive ? 'i' : undefined);

  for (const line of lines) {
    const matches = re.exec(line.trim());
    if (matches) {
      return matches[1].trim();
    }
  }
}

function mapKey(key, keyMap) {
  return keyMap[key] ? keyMap[key] : key;
}

function parser({ filePath, content, lines, keys, keyMap = {}, delimiter = '=', caseInsensitive = false }) {
  lines = getLines({ filePath, content, lines });

  const obj = {};

  for (const key of util.listify(keys)) {
    obj[mapKey(key, keyMap)] = valueForKey({ lines, key, delimiter, caseInsensitive });
  }

  return obj;
}

export default parser;

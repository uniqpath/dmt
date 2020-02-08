import fs from 'fs';
import scan from '../../scan';
import util from '../../util';

function valueForKey({ lines, key, delimiter }) {
  const line = lines.find(line => line.trim().startsWith(`${key}${delimiter}`));
  return line
    ? line
        .split(delimiter)
        .slice(1)
        .join(delimiter)
        .trim()
    : undefined;
}

function mapKey(key, keyMap) {
  return keyMap[key] ? keyMap[key] : key;
}

function parser({ filePath, content, lines, keys, keyMap = {}, delimiter = '=' }) {
  if (filePath && fs.existsSync(filePath)) {
    try {
      lines = scan.readFileLines(filePath);
    } catch (e) {
      return {};
    }
  }

  if (content) {
    const EOL = util.autoDetectEOLMarker(content);
    lines = content.split(EOL);
  }

  const obj = {};

  for (const key of util.listify(keys)) {
    obj[mapKey(key, keyMap)] = valueForKey({ lines, key, delimiter });
  }

  return obj;
}

export default parser;

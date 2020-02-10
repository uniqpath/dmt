import simpleKeyValuePairs from './simpleKeyValuePairs';
import { getLines } from './helpers';

function parser({ filePath, content, lines, section, keys, keyMap = {}, delimiter = '=' }) {
  lines = getLines({ filePath, content, lines });

  const sectionLines = [];

  let insideSection = false;

  for (const line of lines) {
    if (line.match(new RegExp(`\\[${section}\\]`))) {
      insideSection = true;
    } else if (line.match(new RegExp('\\[.*?\\]'))) {
      insideSection = false;
    }

    if (insideSection) {
      sectionLines.push(line);
    }
  }

  return simpleKeyValuePairs({ lines: sectionLines, keys, keyMap, delimiter });
}

export default parser;

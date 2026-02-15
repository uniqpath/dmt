import fs from 'fs';
import scan from '../../scan.js';
import util from '../../util.js';

function getLines({ filePath, content, lines }) {
  let resultingLines = lines;

  if (filePath && fs.existsSync(filePath)) {
    try {
      resultingLines = scan.readFileLines(filePath);
    } catch (e) {
      return {};
    }
  }

  if (content != null) {
    const EOL = util.autoDetectEOLMarker(content);
    resultingLines = content.split(EOL);
  }

  return resultingLines;
}

export { getLines };

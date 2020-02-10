import fs from 'fs';
import scan from '../../scan';
import util from '../../util';

function getLines({ filePath, content, lines }) {
  let resultingLines = lines;

  if (filePath && fs.existsSync(filePath)) {
    try {
      resultingLines = scan.readFileLines(filePath);
    } catch (e) {
      return {};
    }
  }

  if (content) {
    const EOL = util.autoDetectEOLMarker(content);
    resultingLines = content.split(EOL);
  }

  return resultingLines;
}

export { getLines };

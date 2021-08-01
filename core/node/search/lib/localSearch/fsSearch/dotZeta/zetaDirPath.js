import path from 'path';
import fs from 'fs';

function zetaDirPath(dirPath) {
  console.log(`::: ${dirPath}`);

  if (dirPath == '/') {
    return;
  }

  const zetaDir = path.join(dirPath, '.zeta');

  if (fs.existsSync(zetaDir)) {
    return zetaDir;
  }

  return zetaDirPath(path.dirname(dirPath));
}

function _zetaDirPath(filePath) {
  return zetaDirPath(path.dirname(filePath));
}

export default _zetaDirPath;

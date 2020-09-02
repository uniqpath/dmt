import path from 'path';

function isInsideZetaDir(fsPath) {
  if (fsPath == '/') {
    return false;
  }

  if (path.basename(fsPath) == '.zeta') {
    return true;
  }

  return isInsideZetaDir(path.dirname(fsPath));
}

export default isInsideZetaDir;

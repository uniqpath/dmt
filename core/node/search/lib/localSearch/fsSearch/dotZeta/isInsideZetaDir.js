import path from 'path';

function isInsideZetaDir(fsPath) {
  return false;

  if (fsPath == '/') {
    return false;
  }

  if (path.basename(fsPath) == '.zeta') {
    return true;
  }

  return isInsideZetaDir(path.dirname(fsPath));
}

export default isInsideZetaDir;

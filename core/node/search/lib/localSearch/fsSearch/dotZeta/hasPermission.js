import path from 'path';

function isInsideZetaDir(fsPath) {
  if (fsPath == '/') {
    return false;
  }

  if (path.basename(fsPath) == '.zeta') {
    return true;
  }

  return isInsideZetaDir(path.resolve(fsPath, '..'));
}

function allowFSResult({ filePath, accessKey }) {
  return (
    filePath.trim() != '' &&
    !filePath.endsWith('.DS_Store') &&
    !(path.basename(filePath).startsWith('~$') && filePath.endsWith('.docx')) &&
    !filePath.endsWith('.swp') &&
    !filePath.endsWith('.zeta.txt') &&
    !filePath.endsWith('.zeta.json') &&
    !isInsideZetaDir(filePath) &&
    hasPermission({ filePath, accessKey })
  );
}

export default allowFSResult;

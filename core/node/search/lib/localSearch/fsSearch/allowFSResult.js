import path from 'path';
import isInsideZetaDir from './dotZeta/isInsideZetaDir';

function allowFSResult(filePath) {
  return (
    filePath.trim() != '' &&
    !filePath.endsWith('.DS_Store') &&
    !(path.basename(filePath).startsWith('~$') && filePath.endsWith('.docx')) &&
    !filePath.endsWith('.swp') &&
    !filePath.endsWith('.zeta.txt') &&
    !filePath.endsWith('.zeta.json') &&
    !isInsideZetaDir(filePath)
  );
}

export default allowFSResult;

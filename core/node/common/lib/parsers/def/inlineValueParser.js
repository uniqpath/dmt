import operatorFrom from './inlineHandlers/operatorFrom.js';

export default inlineValueParser;

function inlineValueParser(str, { cwd, parseFile }) {
  return operatorFrom(str, { parseFile, cwd });
}

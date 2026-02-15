import toSpace from './toSpaceCase.js';

export default toSnakeCase;

function toSnakeCase(string) {
  return toSpace(string).replace(/\s/g, '_');
}

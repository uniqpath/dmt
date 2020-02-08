import toSpace from './toSpaceCase';

export default toSnakeCase;

function toSnakeCase(string) {
  return toSpace(string).replace(/\s/g, '_');
}

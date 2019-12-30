var toSpace = require('./toSpaceCase');

module.exports = toSnakeCase;

function toSnakeCase(string) {
  return toSpace(string).replace(/\s/g, '_');
}

var clean = require('./toNoCase');

module.exports = toSpaceCase;

function toSpaceCase(string) {
  return clean(string)
    .replace(/[\W_]+(.|$)/g, function(matches, match) {
      return match ? ' ' + match : '';
    })
    .trim();
}

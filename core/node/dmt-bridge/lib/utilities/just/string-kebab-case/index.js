module.exports = kebabCase;

var wordSeparators = /[\s\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]+/;
var capitals = /[A-Z\u00C0-\u00D6\u00D9-\u00DD]/g;

function kebabCase(str) {
  str = str.replace(capitals, function(match) {
    return ' ' + (match.toLowerCase() || match);
  });
  return str
    .trim()
    .split(wordSeparators)
    .join('-');
}

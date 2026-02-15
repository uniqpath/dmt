export default toNoCase;

var hasSpace = /\s/;
var hasSeparator = /(_|-|\.|:)/;
var hasCamel = /([a-z][A-Z]|[A-Z][a-z])/;

function toNoCase(string) {
  if (hasSpace.test(string)) return string.toLowerCase();
  if (hasSeparator.test(string)) return (unseparate(string) || string).toLowerCase();
  if (hasCamel.test(string)) return uncamelize(string).toLowerCase();
  return string.toLowerCase();
}

var separatorSplitter = /[\W_]+(.|$)/g;

function unseparate(string) {
  return string.replace(separatorSplitter, function(m, next) {
    return next ? ' ' + next : '';
  });
}

var camelSplitter = /(.)([A-Z]+)/g;

function uncamelize(string) {
  return string.replace(camelSplitter, function(m, previous, uppers) {
    return (
      previous +
      ' ' +
      uppers
        .toLowerCase()
        .split('')
        .join(' ')
    );
  });
}

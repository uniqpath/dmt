module.exports = zip;

function zip() {
  var result = [];
  var args = Array.prototype.slice.call(arguments);
  var argsLen = args.length;
  var maxLen = 0;
  var i, j;

  if (!argsLen) {
    throw new Error('zip requires at least one argument');
  }

  for (i = 0; i < argsLen; i++) {
    if (!Array.isArray(args[i])) {
      throw new Error('all arguments must be arrays');
    }
    var arrLen = args[i].length;
    if (arrLen > maxLen) {
      maxLen = arrLen;
    }
  }

  for (i = 0; i < maxLen; i++) {
    var group = [];
    for (j = 0; j < argsLen; j++) {
      if (!Array.isArray(args[j])) {
        throw new Error('all arguments must be arrays');
      }
      group[j] = args[j][i];
    }
    result[i] = group;
  }

  return result;
}

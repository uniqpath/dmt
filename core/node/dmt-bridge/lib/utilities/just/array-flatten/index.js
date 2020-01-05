module.exports = flatten;

function flatten(arr) {
  if (!Array.isArray(arr)) {
    throw new Error('expected an array');
  }
  var result = [];
  var len = arr.length;
  for (var i = 0; i < len; i++) {
    var elem = arr[i];
    if (Array.isArray(elem)) {
      result.push.apply(result, flatten(elem));
    } else {
      result.push(elem);
    }
  }
  return result;
}

export default compact;

function compact(arr) {
  if (!Array.isArray(arr)) {
    throw new Error('expected an array');
  }
  var result = [];
  var len = arr.length;
  for (var i = 0; i < len; i++) {
    var elem = arr[i];
    if (elem) {
      result.push(elem);
    }
  }
  return result;
}

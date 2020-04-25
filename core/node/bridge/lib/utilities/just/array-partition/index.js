export default partition;

function partition(arr, fn) {
  if (!Array.isArray(arr)) {
    throw new Error('expected first argument to be an array');
  }
  if (typeof fn != 'function') {
    throw new Error('expected second argument to be a function');
  }
  var first = [];
  var second = [];
  var length = arr.length;
  for (var i = 0; i < length; i++) {
    var nextValue = arr[i];
    if (fn(nextValue)) {
      first.push(nextValue);
    } else {
      second.push(nextValue);
    }
  }
  return [first, second];
}

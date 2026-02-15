export default split;

function split(arr, n) {
  if (!Array.isArray(arr)) {
    throw new Error('expected an array for the first argument');
  }
  if (n != null && typeof n != 'number') {
    throw new Error('expected a number or null for the second argument');
  }
  n = n != null ? n : arr.length;
  var len = arr.length;
  var groups = [];
  for (var i = 0; i < len; i += n) {
    groups.push(arr.slice(i, i + n));
  }
  return groups;
}

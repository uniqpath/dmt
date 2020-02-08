export default index;

function index(arr, key) {
  if (!Array.isArray(arr)) {
    throw new Error('expected an array for first argument');
  }
  if (typeof key != 'string') {
    throw new Error('expected a string for second argument');
  }
  var result = {};
  var len = arr.length;
  for (var i = 0; i < len; i++) {
    var index = arr[i] && arr[i][key];

    if (index) {
      result[index] = arr[i];
    }
  }
  return result;
}

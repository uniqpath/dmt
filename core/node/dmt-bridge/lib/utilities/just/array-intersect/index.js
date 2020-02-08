export default intersect;

function intersect(arr1, arr2) {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
    throw new Error('expected both arguments to be arrays');
  }
  var result = [];
  var len = arr1.length;
  for (var i = 0; i < len; i++) {
    var elem = arr1[i];
    if (arr2.indexOf(elem) > -1 && result.indexOf(elem) == -1) {
      result.push(elem);
    }
  }
  return result;
}

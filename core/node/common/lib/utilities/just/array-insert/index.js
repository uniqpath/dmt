export default insert;

function insert(arr1, arr2, index) {
  if (!Array.isArray(arr1)) {
    throw new Error('expected an array for first argument');
  }
  if (arguments.length > 2 && typeof index != 'number') {
    throw new Error('expected a number for third argument');
  }
  if (!Array.isArray(arr2)) {
    arr2 = [arr2];
  }
  if (!index) {
    return arr2.concat(arr1);
  }
  var front = arr1.slice(0, index);
  var back = arr1.slice(index);
  return front.concat(arr2, back);
}

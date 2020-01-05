module.exports = last;

function last(arr) {
  if (!Array.isArray(arr)) {
    throw new Error('expected an array');
  }
  return arr[arr.length - 1];
}

module.exports = splitAt;

function splitAt(arr, n) {
  if (!Array.isArray(arr)) {
    throw new Error('expected an array for the first argument');
  }
  if (n != null && typeof n != 'number') {
    throw new Error('expected a number or null for the second argument');
  }
  if (n == null) {
    n = 0;
  }
  return [arr.slice(0, n), arr.slice(n)];
}

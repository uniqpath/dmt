module.exports = clamp;

function clamp(b1, n, b2) {
  if (typeof b1 != 'number' || typeof n != 'number' || typeof b2 != 'number') {
    throw new Error('arguments must be numbers');
  }
  if (isNaN(b1) || isNaN(n) || isNaN(b2)) {
    return NaN;
  }
  if (b1 == b2) {
    return b1;
  }
  var lower, higher;
  b1 < b2 ? ((lower = b1), (higher = b2)) : ((higher = b1), (lower = b2));
  if (n < lower) {
    return lower;
  }
  if (n > higher) {
    return higher;
  }
  return n;
}

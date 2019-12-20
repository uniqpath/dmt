module.exports = leftPad;

var surrogatePairRegEx = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;

function leftPad(str, length, padStr) {
  if (typeof str != 'string' || (arguments.length > 2 && typeof padStr != 'string') || !(isFinite(length) && length >= 0 && Math.floor(length) === length)) {
    throw Error('1st and 3rd args must be strings, 2nd arg must be a positive integer');
  }
  if (padStr == null || padStr == '') {
    padStr = ' ';
  }
  var strLen = str.length - (str.match(surrogatePairRegEx) || []).length;
  var padStrLen = padStr.length;
  var surrPairsInPad = (padStr.match(surrogatePairRegEx) || []).length;
  if (surrPairsInPad && padStrLen / surrPairsInPad != 2) {
    throw Error('padding mixes regular characters and surrogate pairs');
  }

  if (!length || length <= strLen) {
    return str;
  }
  var padCount = Math.floor((length - strLen) / padStrLen);
  var padRemainder = (length - strLen) % padStrLen;
  if (surrPairsInPad) {
    padCount = 2 * padCount;
    padRemainder = 2 * padRemainder;
  }
  return (padRemainder ? [padStr.slice(-padRemainder)] : [])
    .concat(new Array(padCount + 1).join(padStr))
    .concat(str)
    .join('');
}

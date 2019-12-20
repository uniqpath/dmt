module.exports = isCircular;

var errorKeywords = ['circular', 'cyclic'];

function isCircular(obj) {
  if (typeof obj === 'function') {
    throw new Error('cannot determine if function is circular');
  }
  try {
    JSON.stringify(obj);
  } catch (err) {
    var index = errorKeywords.length;
    while (index--) {
      if (err.message.indexOf(errorKeywords[index]) > -1) {
        return true;
      }
    }
    throw err;
  }
  return false;
}

module.exports = values;

function values(obj) {
  var result = [];
  if (Array.isArray(obj)) {
    return obj.slice(0);
  }
  if (typeof obj == 'object' || typeof obj == 'function') {
    var keys = Object.keys(obj);
    var len = keys.length;
    for (var i = 0; i < len; i++) {
      result.push(obj[keys[i]]);
    }
    return result;
  }
  throw new Error('argument to `values` must be an object');
}

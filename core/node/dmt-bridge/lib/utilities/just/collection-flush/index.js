module.exports = flush;

function flush(collection) {
  var result, len, i;
  if (!collection) {
    return undefined;
  }
  if (Array.isArray(collection)) {
    result = [];
    len = collection.length;
    for (i = 0; i < len; i++) {
      var elem = collection[i];
      if (elem != null) {
        result.push(elem);
      }
    }
    return result;
  }
  if (typeof collection == 'object') {
    result = {};
    var keys = Object.keys(collection);
    len = keys.length;
    for (i = 0; i < len; i++) {
      var key = keys[i];
      var value = collection[key];
      if (value != null) {
        result[key] = value;
      }
    }
    return result;
  }
  return undefined;
}

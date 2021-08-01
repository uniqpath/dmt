export default pluck;

function pluck(collection, propertyName) {
  if (!collection || typeof collection != 'object') {
    return new Error('expected first argument to be an object or array');
  }

  var result, len, i, keys, key;
  if (Array.isArray(collection)) {
    result = [];
    len = collection.length;
    for (i = 0; i < len; i++) {
      result.push(collection[i][propertyName]);
    }
  } else {
    result = {};
    keys = Object.keys(collection);
    len = keys.length;
    for (i = 0; i < len; i++) {
      key = keys[i];
      result[key] = collection[key][propertyName];
    }
  }
  return result;
}

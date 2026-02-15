export default filter;

function filter(obj, predicate) {
  var result = {};
  var keys = Object.keys(obj);
  var len = keys.length;
  for (var i = 0; i < len; i++) {
    var key = keys[i];
    if (predicate(key, obj[key])) {
      result[key] = obj[key];
    }
  }
  return result;
}

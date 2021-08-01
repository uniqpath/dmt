export default map;

function map(obj, predicate) {
  var result = {};
  var keys = Object.keys(obj);
  var len = keys.length;
  for (var i = 0; i < len; i++) {
    var key = keys[i];
    var value = obj[key];
    var newKey = predicate(value, key, obj);
    result[newKey] = value;
  }
  return result;
}

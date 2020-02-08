export default map;

function map(obj, predicate) {
  var result = {};
  var keys = Object.keys(obj);
  var len = keys.length;
  for (var i = 0; i < len; i++) {
    var key = keys[i];
    result[key] = predicate(key, obj[key]);
  }
  return result;
}

export default flip;

function flip(obj) {
  var result = {};
  var keys = Object.keys(obj);
  var len = keys.length;
  for (var i = 0; i < len; i++) {
    var key = keys[i];
    result[obj[key]] = key;
  }
  return result;
}

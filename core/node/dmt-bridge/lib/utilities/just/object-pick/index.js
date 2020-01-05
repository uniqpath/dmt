module.exports = pick;

function pick(obj, select) {
  var result = {};
  if (typeof select === 'string') {
    select = [].slice.call(arguments, 1);
  }
  var len = select.length;
  for (var i = 0; i < len; i++) {
    var key = select[i];
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

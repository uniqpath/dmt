module.exports = entries;

function entries(obj) {
  if ((typeof obj != 'object' && typeof obj != 'function') || obj == null) {
    throw new Error('argument to `entries` must be an object');
  }

  var result = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      result.push([key, obj[key]]);
    }
  }
  return result;
}

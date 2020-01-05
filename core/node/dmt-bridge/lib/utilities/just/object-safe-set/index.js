module.exports = set;

function set(obj, props, value) {
  if (typeof props == 'string') {
    props = props.split('.');
  }
  if (typeof props == 'symbol') {
    props = [props];
  }
  var lastProp = props.pop();
  if (!lastProp) {
    return false;
  }
  var thisProp;
  while ((thisProp = props.shift())) {
    if (typeof obj[thisProp] == 'undefined') {
      obj[thisProp] = {};
    }
    obj = obj[thisProp];
    if (!obj || typeof obj != 'object') {
      return false;
    }
  }
  obj[lastProp] = value;
  return true;
}

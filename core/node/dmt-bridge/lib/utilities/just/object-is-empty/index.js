export default isEmpty;

function isEmpty(obj) {
  if (obj == null) {
    return true;
  }

  if (Array.isArray(obj)) {
    return !obj.length;
  }

  if (typeof obj == 'object') {
    return !Object.keys(obj).length;
  }

  return !obj;
}

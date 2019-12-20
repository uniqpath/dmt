module.exports = typeOf;

function typeOf(obj) {
  if (obj === null) {
    return 'null';
  }
  if (obj !== Object(obj)) {
    return typeof obj;
  }
  return {}.toString
    .call(obj)
    .slice(8, -1)
    .toLowerCase();
}

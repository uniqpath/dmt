module.exports = isPrimitive;

function isPrimitive(obj) {
  return obj !== Object(obj);
}

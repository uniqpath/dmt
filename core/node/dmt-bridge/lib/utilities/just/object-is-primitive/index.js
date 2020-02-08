export default isPrimitive;

function isPrimitive(obj) {
  return obj !== Object(obj);
}

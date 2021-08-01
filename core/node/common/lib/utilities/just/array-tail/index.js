export default tail;

function tail(arr) {
  if (!Array.isArray(arr)) {
    throw new Error('expected an array');
  }
  return arr.slice(1);
}

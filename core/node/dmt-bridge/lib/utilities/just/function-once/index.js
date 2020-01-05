module.exports = once;

function once(fn) {
  var called, value;

  if (typeof fn !== 'function') {
    throw new Error('expected a function but got ' + fn);
  }

  return function wrap() {
    if (called) {
      return value;
    }
    called = true;
    value = fn.apply(this, arguments);
    return value;
  };
}

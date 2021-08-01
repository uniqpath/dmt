export default demethodize;

function demethodize(fn) {
  if (typeof fn != 'function') {
    throw new Error('expected a function, got', fn);
  }
  return function(thisValue) {
    if (thisValue == null) {
      throw new Error('expected a value for 1st arg, got ' + thisValue);
    }
    var args = [].slice.call(arguments);
    return fn.apply(args.shift(), args);
  };
}

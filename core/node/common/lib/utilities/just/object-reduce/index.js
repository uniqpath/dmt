export default reduce;

function reduce(obj, predicate) {
  var args = [callback];
  var hasInitialValue = 2 in arguments;
  hasInitialValue && args.push(arguments[2]);

  function callback(previousValue, currentKey, currentIndex, array) {
    if (!hasInitialValue) {
      previousValue = obj[array[0]];
      hasInitialValue = true;
    }
    return predicate(previousValue, currentKey, obj[currentKey], currentIndex, array);
  }

  return Array.prototype.reduce.apply(Object.keys(obj), args);
}

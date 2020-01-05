module.exports = partial;

function partial(fn) {
  var partialArgs = [].slice.call(arguments, 1);
  if (!partialArgs.length) {
    return fn;
  }
  return function() {
    var args = [].slice.call(arguments);
    var derivedArgs = [];
    for (var i = 0; i < partialArgs.length; i++) {
      var thisPartialArg = partialArgs[i];
      derivedArgs[i] = thisPartialArg === undefined ? args.shift() : thisPartialArg;
    }
    return fn.apply(this, derivedArgs.concat(args));
  };
}

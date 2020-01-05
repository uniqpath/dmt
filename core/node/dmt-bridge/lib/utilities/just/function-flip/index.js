module.exports = flip;

function flip(fn) {
  return function() {
    var first = arguments[0];
    var second = arguments[1];
    var rest = [].slice.call(arguments, 2);
    return fn.apply(this, [second, first].concat(rest));
  };
}
